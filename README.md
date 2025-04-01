Hello This is the readme file : <br>
The project contain 3 folders with 3 microservice <br>
to run this project correctly please do the following instructions: <br>
1- open folder event-microservice and run:   docker-compose down
docker-compose up -d --build <br>
2- open folder service-producer then run: node src/index.js <br>
3- open folder service-consumer then run: node src/index.js <br>
4- then you have 2 apis ==> 1 post to proceed into kafka 1 api get to get  all data that saved to local database mongo <br>
