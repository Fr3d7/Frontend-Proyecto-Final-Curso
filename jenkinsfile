pipeline {
  agent any

  options {
    skipDefaultCheckout(true)
    ansiColor('xterm')
    timestamps()
  }

  parameters {
    choice(name: 'TARGET_BRANCH', choices: ['DEV', 'QA', 'PROD'], description: 'Solo para jobs NO multibranch.')
  }

  environment {
    RAW_BRANCH  = "${env.BRANCH_NAME ?: (params.TARGET_BRANCH ?: (env.JOB_BASE_NAME?.toLowerCase()?.contains('prod') ? 'PROD' : (env.JOB_BASE_NAME?.toLowerCase()?.contains('qa') ? 'QA' : 'DEV')))}"
    PIPE_BRANCH = "${RAW_BRANCH.toUpperCase()}"
    PROJECT_KEY = "frontend-proyecto-final-${PIPE_BRANCH}"
    SCANNER_HOME = tool 'sonar-scanner-win'     // Debe existir en Global Tool Config
    REPO_URL    = "https://github.com/Fr3d7/Frontend-Proyecto-Final-Curso.git"
  }

  stages {
    stage('Checkout') {
      steps {
        echo "📦 Proyecto: ${env.PROJECT_KEY} | 🧵 Rama destino: ${env.PIPE_BRANCH}"
        checkout([$class: 'GitSCM',
          branches: [[name: "*/${PIPE_BRANCH}"]],
          userRemoteConfigs: [[url: "${env.REPO_URL}", credentialsId: 'github-creds']]
        ])
      }
    }

    stage('Install dependencies') {
      steps {
        bat 'npm ci || npm install'
      }
    }

    stage('Run tests (coverage via CRA)') {
      steps {
        // CRA maneja CSS/JSX y genera coverage/lcov.info
        bat '''
          set CI=true
          npm test -- --coverage --watchAll=false --ci --passWithNoTests ^
            --coverageReporters=lcov ^
            --collectCoverageFrom="src/**/*.{js,jsx,ts,tsx}" ^
            --testPathIgnorePatterns="/node_modules/","/build/"
        '''
        // Falla si no hay LCOV o si está vacío (Windows-safe)
        bat 'if not exist coverage\\lcov.info (echo ERROR: no coverage\\lcov.info && exit /b 1)'
        bat 'forfiles /p coverage /m lcov.info /c "cmd /c if @fsize LEQ 20 (echo ERROR: LCOV too small ^(@fsize^ bytes^) && exit /b 1) else echo LCOV size=@fsize bytes"'
      }
    }

    stage('Build app') {
      steps {
        bat '''
          set CI=
          npm run build
        '''
      }
    }

    stage('SonarQube Analysis') {
      steps {
        withCredentials([string(credentialsId: 'sonarqube-token', variable: 'SONAR_TOKEN')]) {
          withSonarQubeEnv('sonar-local') {
            bat """
              "%SCANNER_HOME%\\bin\\sonar-scanner.bat" ^
                -Dsonar.projectKey=${PROJECT_KEY} ^
                -Dsonar.projectName=${PROJECT_KEY} ^
                -Dsonar.projectVersion=${BUILD_NUMBER} ^
                -Dsonar.projectBaseDir=%WORKSPACE% ^
                -Dsonar.sources=src ^
                -Dsonar.tests=src ^
                -Dsonar.test.inclusions=**/*.test.{js,jsx,ts,tsx},**/__tests__/** ^
                -Dsonar.sourceEncoding=UTF-8 ^
                -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info ^
                -Dsonar.typescript.lcov.reportPaths=coverage/lcov.info ^
                -Dsonar.token=%SONAR_TOKEN%
            """
          }
        }
      }
    }

    stage('Quality Gate') {
      steps {
        timeout(time: 10, unit: 'MINUTES') {
          waitForQualityGate abortPipeline: true
        }
      }
    }

    stage('Package artifact') {
      steps {
        archiveArtifacts artifacts: 'build/**', fingerprint: true
      }
    }

    stage('Deploy') {
      when { expression { env.PIPE_BRANCH == 'QA' || env.PIPE_BRANCH == 'PROD' } }
      steps {
        script {
          def deployPath = (env.PIPE_BRANCH == 'PROD') ? 'C:\\deploy\\frontend' : 'C:\\deploy\\frontend-qa'
          bat """
            if not exist ${deployPath} mkdir ${deployPath}
            xcopy /E /I /Y build ${deployPath}
          """
          echo "🚀 Desplegado a ${deployPath} para rama ${env.PIPE_BRANCH}"
        }
      }
    }
  }

  post {
    always {
      echo "🏁 Fin | Rama: ${env.PIPE_BRANCH} | Build: #${env.BUILD_NUMBER}"
    }
  }
}
