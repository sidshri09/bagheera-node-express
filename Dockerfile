FROM public.ecr.aws/lambda/nodejs:14
# Alternatively, you can pull the base image from Docker Hub: amazon/aws-lambda-nodejs:12

# Assumes your function is named "app.js", and there is a package.json file in the app directory 
COPY app.js package.json auth.js vote.js user.js post.js follower.js all.model.js .env  ${LAMBDA_TASK_ROOT}

# Install NPM dependencies for function
RUN npm install

EXPOSE 5000

# Set the CMD to your handler (could also be done as a parameter override outside of the Dockerfile)
CMD [ "app.handler" ]  