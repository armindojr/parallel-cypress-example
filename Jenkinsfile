def taskNameCF = "qa"
def ENVIRONMENT = ''

pipeline {
  agent {
    kubernetes {
      label "jenkins-slave-${taskNameCF}"
      defaultContainer 'jnlp'
      yaml """
            apiVersion: v1
            kind: Pod
            metadata:
              labels:
                some-label: ${taskNameCF}
            spec:
              containers:
              - name: docker-slave-${taskNameCF}
                image: 'cypress/browsers:node12.16.1-chrome80-ff73'
                securityContext:
                  privileged: true
                resources:
                  limits:
                    memory: "4Gi"
                    cpu: "4"
                  requests:
                    memory: "2Gi"
                    cpu: "2"
                tty: true
                volumeMounts:
                - name: dockersock
                  mountPath: /var/run/docker.sock
                - name: dockerconfig
                  mountPath: /var/lib/docker/
                command:
                - cat
              volumes:
              - name: dockersock
                hostPath:
                  path: /var/run/docker.sock
              - name: dockerconfig
                hostPath:
                  path: /var/lib/docker/
            """
    }
  }

  stages {
    stage("Install") {
      steps {
        container("docker-slave-${taskNameCF}") {
          sh "npm install"
        }
      }
    }
    stage('cypress parallel tests') {
      parallel {
        stage('POD A') {
          steps {
            container("docker-slave-${taskNameCF}") {
              script {
                sh "PODINDEX=0 BROWSER=$BROWSER node cypress-automation-run.js"
              }
            }
          }
        }
        stage('POD B') {
          steps {
            container("docker-slave-${taskNameCF}") {
              script {
                sh "PODINDEX=1 BROWSER=$BROWSER node cypress-automation-run.js"
              }
            }
          }
        }
      }
      post {
        always {
          container("docker-slave-${taskNameCF}") {  
            script {
              publishHTML target: [
                allowMissing: false,
                alwaysLinkToLastBuild: false,
                includes: '**/*',
                keepAll: true,
                reportDir: 'mochawesome-report/',
                reportFiles: 'mochawesome.html',
                reportName: 'Mochawesome Report'
              ]
            }
          }
        }
      }
    }
  }
}