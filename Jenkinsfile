pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                
                checkout scm
            }
        }

        stage('Backend - Composer Install') {
            steps {
                sh 'docker compose run --rm php composer install'
            }
        }

        stage('Frontend - Install') {
            steps {
                sh 'docker compose run --rm frontend npm install'
            }
        }

        stage('Frontend - Build') {
            steps {
                sh 'docker compose run --rm frontend npm run build'
            }
        }
    }
}

