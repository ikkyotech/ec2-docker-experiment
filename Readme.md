# ec2-docker-experiment

Runs a [docker](http://docker.io/) image on a [ec2 spot instance](https://aws.amazon.com/ec2/purchasing-options/spot-instances/) and uploads the results to s3.

# How to use?

1. You need the command line tool:

```bash
$ npm i ec2-docker-experiment -g
```

2. Add a [Dockerfile](https://docs.docker.com/reference/builder/) to your folder. It will be run with ```$ docker run ``` if it works on your system it will most likely also run on the server.

3. Add a ```experiment.yaml``` to your folder that contains the spec for the instance that has to be run.

Then you can start the experiment with in your folder:

```bash
$ ec2-docker-experiment .
```
