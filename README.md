Hello This is the readme file : <br>
The project contain 3 folders with 3 microservice <br>
to run this project correctly please do the following instructions: <br>
1- open folder event-microservice and run:   docker-compose down
docker-compose up -d --build <br>
2- open folder service-producer then run: node src/index.js <br>
3- open folder service-consumer then run: node src/index.js <br>
4- then you have 2 apis ==> 1 post to proceed into kafka 1 api get to get  all data that saved to local database mongo <br>
5- Unfortunately i can't deploy on server because all there aren't any servers free all server want to visa to deployment my project and i prepare all deployments files with using kubernets and i pushed it on github i wish that you understand i what mean and thank you for reading 
