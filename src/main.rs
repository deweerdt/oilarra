extern crate toml;
extern crate serde;

#[macro_use]
extern crate serde_derive;

#[macro_use]
extern crate nickel;

use nickel::{Nickel, Mountable, StaticFilesHandler};

use std::fs::File;
use std::process::exit;
use std::io::{Error, ErrorKind, Read};

#[derive(Debug, Deserialize)]
struct Config {
    listen_address: Option<String>,
    dark_sky_api_key: Option<String>,
}

fn read_config(path: &str) -> Result<Config, Error> {
    let mut fd = File::open(path)?;
    let mut toml = String::new();
    fd.read_to_string(&mut toml)?;
    if let Ok(config) = toml::from_str(&toml) {
        Ok(config)
    } else {
        Err(Error::new(ErrorKind::Other, "oh no!"))
    }
}

fn main() {
    let config = read_config("oilarra.toml");
    if let Err(err) = config {
        println!("{}", err);
        exit(1);
    }
    let mut config = config.unwrap();
    if config.listen_address == None {
        config.listen_address = Some(String::from("0.0.0.0:8080"));
    }
    let mut server = Nickel::new();
    server.mount("/", StaticFilesHandler::new("assets/"));

    server.mount("/",
                 middleware! { |req|
        let path = req.path_without_query().unwrap();
        format!("Not found '{}'!", path)
    });
    server.listen(config.listen_address.unwrap());
}
