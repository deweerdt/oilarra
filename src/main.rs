extern crate toml;
extern crate serde;

#[macro_use]
extern crate serde_derive;

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
    if config.is_err() {
        println!("{}", config.err().unwrap());
        exit(1);
    }
    let config = config.unwrap();
    println!("{:?}", config);
}
