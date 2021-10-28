# DelayedWebhook.js
> Solution for Lemonade Home Assignment built with **Node.js and TypeScript**

Project Delayed Webhook is util that provides API for scheduling and shooting a delayed webhook

## Table of Contents
* [Overview](#overview)
* [Assumptions and Design decisions](#assumptions-and-design-decisions)
* [Technologies Used](#technologies-used)
* [Features](#features)
* [Development](#development)
* [API documentation](#api-documentation)
* [Room for Improvement](#room-for-improvement)
* [Contact](#contact)


## Overview
- Built with **Node.js, Express, and TypeScript**. It's not my primary tech stack, so I invested an entire week to learn it. I love it!
- This implementation is made like a real-world short-deadline optimal solution without any over-complication and unnecessary things
- ***You can check out my [alternative solution to this Home Assignment](https://github.com/serge-arbor/php-delayed-webhook) built with Symfony, which demonstrate API best practices, scalable code structure, auto-documentation with SwaggerUI***

## Assumptions and Design decisions
- The application is required to be used in some local environment without any external access, therefore **the authentication is not required**
- The server should fire the webhook after initializing if the server was down, so I use a Redis-based queue: [bee-queue](https://github.com/bee-queue/bee-queue)
- The workload is not predicted, so queue workers, HTTP API, and storage instances should be scaled independently. For example, **10 http-api + 100 workers**
- There are no requirements to store TBs of data and to have relations between data, to have transactions and complex joins, so **I choose Redis as a store**
- Timer IDs are required to be consecutive natural numbers. It leads to the synchronization between all the HTTP API instances while processing timer creation requests. **This synchronization has been built on top of the Redis' INCR command** and is a bottleneck of the whole system
- **That bottleneck could be eliminated by using UUID** or other kinds of global pseudo-random IDs instead of ordered natural numbers
- There are no requirements for a "back off" strategy, so I left an empty room for covering the case then webhook is not reachable
- The applications consist of two parts: http-api and worker, so I implemented e2e tests to cover the entire system

## Technologies Used
- **Node.js**
- **TypeScript**
- **Redis**
- **Docker**

## Features
- REST API for creating and reading Timer
- Timers are persistent
- Delayed job scheduler
- Http-api and worker instances can be run in parallel and scaled up independently

## Development

Setup local development environment using nvm
```console
nvm install
```

Install dependencies
```console
npm install
```

To build run:
```console
npm run build
```
To run unit-tests:
```console
npm test
```
To run e2e tests:
```console
npm run e2e
```

**To start the whole system locally in the containerized environment run**
```console
npm run local
```

To run API and worker services out of the docker containers you can start Redis separately, for example, running a docker container:
```console
docker run -p 6379:6379 redis:6
```

**By default, API is running at http://localhost:3000**

## API documentation
There are two end-points:
- `POST /timers`
- `GET /timers/:id`

* When the app is running, API documentation is accessible here: http://localhost:3000/api/doc

![drawing](https://i.vgy.me/WaD5Bo.png)


## Room for Improvement
- **The bottleneck of this design is ID auto-increment counter** - Redis' INCR. Because there is a point of synchronization between all the http-api workers. If it's acceptable to replace continuous IDs with **UUIDs or other randomized IDs**, it'll allow scaling the number of http-api instances drastically
- Code Structure should be more accurate
- e2e test should not be hardcode
- 100% Unit Tests Coverage
- Redis could be clustered
- Swagger Documentation should be auto-generated

## Contact
Created by [@serge-arbor](https://www.linkedin.com/in/serge-arbor) - feel free to contact me!
