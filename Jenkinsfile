pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('Run tests') {
            steps {
                bat 'npm test -- --watchAll=false'
            }
        }

        stage('Build app') {
            steps {
                bat 'npm run build'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('sonar-local') {
                    withCredentials([string(credentialsId: 'sonar-token', variable: 'SONAR_TOKEN')]) {
                        script {
                            def scannerHome = tool 'sonar-scanner-win'
                            bat """
                                "${scannerHome}\\bin\\sonar-scanner.bat" ^
                                  -Dsonar.projectKey=frontend-proyecto-final ^
                                  -Dsonar.projectName=frontend-proyecto-final ^
                                  -Dsonar.sources=src ^
                                  -Dsonar.host.url=http://localhost:9000 ^
                                  -Dsonar.login=sqa_d88c9d69aaa3b92fdfa0cb421dc1a7663c167d31
                            """
                        }
                    }
                }
            }
        }
    }

    post {
        success {
            echo "✅ Pipeline OK en rama ${env.BRANCH_NAME}"
        }
        failure {
            echo "❌ Falló el pipeline en rama ${env.BRANCH_NAME}"
        }
    }
}
