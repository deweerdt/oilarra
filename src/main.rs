extern crate clap;
extern crate daemonize;
extern crate rouille;
extern crate serde;
extern crate serde_json;
extern crate toml;

#[macro_use]
extern crate log;
#[macro_use]
extern crate serde_derive;
extern crate env_logger;

use clap::{Arg, App};
use daemonize::Daemonize;
use env_logger::LogBuilder;
use log::{LogRecord, LogLevelFilter};
use rouille::Response;
use std::env;
use std::fs::File;
use std::io::{Error, ErrorKind, Read};
use std::process::exit;


#[derive(Debug, Deserialize)]
struct Config {
    listen_address: String,
    dark_sky: DarkSkyConfig,
}

#[derive(Debug, Deserialize)]
struct DarkSkyConfig {
    api_key: String,
    longitude: String,
    latitude: String,
    units: String,
}

#[derive(Serialize, Deserialize)]
struct JSONResponse {
    err: bool,
    msg: String,
}
fn read_config(path: &str) -> Result<Config, Error> {
    let mut fd = File::open(path)?;
    let mut toml = String::new();
    fd.read_to_string(&mut toml)?;
    match toml::from_str(&toml) {
        Ok(config) => Ok(config),
        Err(e) => Err(Error::new(ErrorKind::Other, e)),
    }
}

fn main() {
    let format = |record: &LogRecord| format!("{} - {}", record.level(), record.args());

    let mut builder = LogBuilder::new();
    builder.format(format).filter(None, LogLevelFilter::Info);

    if env::var("RUST_LOG").is_ok() {
        builder.parse(&env::var("RUST_LOG").unwrap());
    }

    builder.init().unwrap();

    let matches = App::new("Oilarra")
        .version("0.0.1")
        .author("Frederik Deweerdt")
        .about("a clock app")
        .arg(Arg::with_name("config_file")
                 .short("c")
                 .long("config")
                 .value_name("FILE")
                 .help("Path to the oilarra.toml config file")
                 .takes_value(true)
                 .required(false))
        .arg(Arg::with_name("daemonize")
                 .short("d")
                 .long("daemonize")
                 .help("daemonize server")
                 .takes_value(false)
                 .required(false))
        .get_matches();

    let config_file = match matches.value_of("config_file") {
        None => {
            error!("A path to the configuration file is required");
            exit(1);
        }
        Some(config_file) => config_file,
    };
    let daemonize = matches.is_present("daemonize");

    let config = match read_config(config_file) {
        Ok(config) => config,
        Err(err) => {
            error!("Error reading `{}` config file: {}", config_file, err);
            exit(1);
        }
    };

    let mut listen_address = String::new();
    listen_address.push_str(&config.listen_address);

    if daemonize {
        let daemonize = Daemonize::new()
            .pid_file("/tmp/oilarra.pid")
            .chown_pid_file(true)
            .working_directory(".");

        match daemonize.start() {
            Ok(_) => info!("Success, daemonized"),
            Err(e) => error!("{}", e),
        }
    }
    if !daemonize {
        info!("Starting server");
    }
    rouille::start_server(listen_address, move |request| {
        let response = rouille::match_assets(&request, "./assets");

        if response.is_success() {
            return response;
        }

        if request.url() == "/js/config.js" {
            let response = Response::from_data("text/javascript",
                                               format!("var oilarra = {{ \
                dark_sky : {{
                    api_key : \"{}\",
                    longitude : \"{}\",
                    latitude : \"{}\",
                    units : \"{}\"
                }}
            }};",
                                                       &config.dark_sky.api_key,
                                                       &config.dark_sky.longitude,
                                                       &config.dark_sky.latitude,
                                                       &config.dark_sky.units));
            return response;
        }

        if request.url() == "/brightness" {
            let jr = JSONResponse {
                err: false,
                msg: "".to_owned(),
            };
            let response = Response::from_data("application/json",
                                               serde_json::to_string(&jr).unwrap());
            return response;
        }
        Response::html("404 error. Try <a href=\"/README.md\"`>README.md</a> or \
                        <a href=\"/src/lib.rs\">src/lib.rs</a> for example.")
                .with_status_code(404)
    })

}
