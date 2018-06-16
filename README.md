# ANNA-Backend

The backend server for ANNA (Administration Network for Nanosatellite Associations)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

- Vagrant + Virtualbox
 

```
Give examples
```

### Installing

A step by step series of examples that tell you how to get a development env running

Clone the repository

```
git clone https://github.com/ipsaone/ANNA-Backend.git
```

Move in and boot the vagrant box

```
cd ANNA-Backend
vagrant up
```

Wait for it to boot, and finally start the server

```
vagrant ssh
cd ANNA-Backend
npm start
```

It should output a message containing the IP and port the server is listening to

## Running the tests

```
npm run test
```


### Coding style

[TODO]

## Deployment

Depencencies are :
- Redis server
- MySQL (SQLite3 to run the tests)

## Built With

* [Express](https://expressjs.com/) - The web framework used
* [NodeJS & NPM](https://nodejs.org/en/) - Dependency Management

## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## Authors

* **MagixInTheAir** - *Project leader* - [MagixInTheAir](https://github.com/MagixInTheAir)
* **IPSA ONE** - *Development team* - [ANNA Development team](https://github.com/orgs/ipsaone/teams/anna)

See also the list of [contributors](https://github.com/ipsaone/ANNA-Backend/graphs/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Hat tip to anyone whose code was used
* Inspiration
* etc
