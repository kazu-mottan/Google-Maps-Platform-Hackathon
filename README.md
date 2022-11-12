# Quistroll

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

--------------------------------------------------README記載内容-----------------------------------------------------------------------

# Quistroll

## Overview

Quistroll is a service that brings a new function to Google Map which takes us to unfamiliar places in abroad.

In case you are sick of all-too-common travel, we highly recommend that you use Quistroll.

## Setup

Quistroll consists of several external services. Get some necessary information and set the environment variables by following the steps below.

### Maps Javascript API 

Please refer to [this document](https://developers.google.com/maps/documentation/javascript/get-api-key?hl=ja) to issue an API key and endpoint.

If the API key is issued, set the environment variable as follows.

```shell
export VUE_APP_GOOGLE_MAP_KEY = <your-maps-javascript-api-key>
```

### Google Map Platform

Create your Google account by referring to [this document](https://support.google.com/accounts/answer/27441)

Go to the [Google Cloud console](https://cloud.google.com) and set up a billing account. Then, make a project on Google Cloud console and activate Maps JavaScript API.

After activating  Maps JavaScript API, choose Places API and Directions API.

Next, issue your API key and set the limit number of using your API key per a day.

### dotenv

In addition, Quistroll uses [dotenv](https://github.com/motdotla/dotenv) library.

You can also set environment variables by adding a .env file directly under the project root folder.

## Deployment

Quistroll is built up with Node.js. When you deploy, you can use a free Node.js service such as [Glitch](https://glitch.com/) or set up your Node.js environment on a paid computing service.

To start up the program, simply execute the following command.

```shell
npm run build
```

## How to use
Turn on your location service on your smart phone, then open your browser and follow instructions.

Since a quiz is displayed on the upper side of your browser, so head to a place where a quiz indicates and click on submit button.

Quistroll supports follwing cities; Tokyo, New York, and Paris.

### Detail

1. Point of departure and final destination is designated in each city. What you do is that head to final destination via some checkpoints.

2. After clicking on submit button, Quistroll judges your location is right or not based on your current location on GPS, Quistroll checks your location if it is right or not. 

3. If your submission is right, Quistroll shows next checkpoint's quiz, so go to the next destination. If your submission is wrong, some hints pop up depending on the number of times you submit wrong location. By the way, hints are displayed up to three times. Based on some hints, find a correct checkpoint.

> **Note**  
