def kubernetes_config = """
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: node
    image: node:8.12
    tty: true
    resources:
      limits:
        memory: "2Gi"
        cpu: "1"
      requests:
        memory: "2Gi"
        cpu: "1"
    command:
    - cat
    volumeMounts:
    - mountPath: "/home/jenkins"
      name: "jenkins-home"
      readOnly: false
  volumes:
  - name: "jenkins-home"
    emptyDir: {}
"""

pipeline {
    agent {
        kubernetes {
            label 'emfcloud-agent-pod'
            yaml kubernetes_config
        }
    }
    options {
        buildDiscarder logRotator(numToKeepStr: '15')
    }
    
    stages {
        stage('Build package') {
            steps {
                container('node') {
                    dir('modelserver-theia') {
                        sh "yarn install"
                    }
                }
            }
        }

        stage('Deploy (master only)') {
            when { branch 'master' }
            steps {
                container('node') {
                    dir('modelserver-theia') {
                        sh 'echo master deploy triggered'
                        withCredentials([string(credentialsId: 'npmjs-token', variable: 'NPM_AUTH_TOKEN')]) {
                            sh 'printf "//registry.npmjs.org/:_authToken=${NPM_AUTH_TOKEN}\n" >> /home/jenkins/.npmrc'
                        }
                        sh 'git config user.email "eclipse-emfcloud-bot@eclipse.org"'
                        sh 'git config user.name "eclipse-emfcloud-bot"'
                        sh 'yarn publish:next'
                    }
                }
            }
        }
    }
}