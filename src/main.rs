extern crate toml;
extern crate serde;

#[macro_use]
extern crate serde_derive;

extern crate rouille;

use rouille::Response;

use std::fs::File;
use std::process::exit;
use std::io::{Error, ErrorKind, Read};



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
    let config = read_config("oilarra.toml");
    if let Err(err) = config {
        println!("{}", err);
        exit(1);
    }
    let config = config.unwrap();

    let mut listen_address = String::new();
    listen_address.push_str(&config.listen_address);

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

        Response::html("404 error. Try <a href=\"/README.md\"`>README.md</a> or \
                        <a href=\"/src/lib.rs\">src/lib.rs</a> for example.")
                .with_status_code(404)
    })

}
