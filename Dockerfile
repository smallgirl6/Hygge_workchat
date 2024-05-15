FROM node:14-alpine

WORKDIR /workchat

COPY ["package*.json", "./"]

RUN npm install

RUN npm rebuild bcrypt
RUN npm install aws-sdk
RUN npm install socket.io
RUN npm install express-session
RUN npm install express-session
RUN npm install multer
RUN npm install dotenv
RUN npm install body-parser
RUN npm install mongoose
RUN npm install openai
RUN npm install buffer

COPY . .

EXPOSE 5005
CMD [ "node", "app.js" ]
