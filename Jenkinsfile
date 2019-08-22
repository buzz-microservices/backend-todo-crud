pipeline {
  agent none
  options { 
    buildDiscarder(logRotator(numToKeepStr: '5'))
    skipDefaultCheckout true
  }
  stages {
    stage('Acquiring pod') {
	 agent {
            kubernetes {
                label 'node'
                yamlFile 'pod-templates/node-pod.yaml'
                }
            }	
            stages{
                stage('Install'){
                    steps {
                        container('node') {
                        checkout scm
                        sh 'npm install'
		                stash includes: 'Dockerfile', name: 'Dockerfile'
                        script{
		                version = sh(returnStdout: true, script: """
                        node -pe "require('./package.json').version" | tr -d '[:space:]'
                        """)
 		                }
                         echo "App Version: ${version}"
                   }

              }
                    }
                
            
            stage('Test'){
                    steps {
                        container('node') {
                        echo "no tests"
                        //sh 'CI=true npm test'
                    }
                    script{
                   commitHash = sh(returnStdout: true, script: "git rev-parse HEAD | cut -c1-7 | tr -d '\n'")
                 }
            }
            post {
                always {
                   echo "done"     
                }
                }
            }

	    }
        }
        stage('Build Docker Image') {
         agent {
            kubernetes {
                label 'kaniko'
                yamlFile 'pod-templates/kaniko-pod.yaml'
                }
            }
            steps {
              container(name: 'kaniko', shell: '/busybox/sh') {
                unstash 'Dockerfile'
                withEnv(['PATH+EXTRA=/busybox:/kaniko']) {
            	sh """#!/busybox/sh
            	executor -f ${pwd()}/Dockerfile -c git://github.com/buzz-microservices/backend-todo-crud.git -d gcr.io/na-csa-msuarez/backend-todo-crud:${BUILD_NUMBER} -d gcr.io/na-csa-msuarez/backend-todo-crud:${version}-${commitHash} -d gcr.io/na-csa-msuarez/backend-todo-crud:latest
                """
                   }
              }
            }
        }
        stage('Helm install') {
         agent {
            kubernetes {
                label 'helm-kubectl'
                yamlFile 'pod-templates/helm-kubectl-pod.yaml'
                }
            }
            steps {
                checkout scm
              container('helm-kubectl') {
                sh "curl -X DELETE http://34.67.152.26:8080/api/charts/backend-todo-crud/0.0.1"
		        sh "helm package --version 0.0.1 --app-version ${version} backend-todo-crud --debug --save=false"
		        sh """curl -L --data-binary "@backend-todo-crud-0.0.1.tgz" http://34.67.152.26:8080/api/charts"""
		        sh "helm init --client-only"
		        sh "helm repo add chartmuseum http://34.67.152.26:8080"
                sh "helm upgrade backend-todo-crud chartmuseum/backend-todo-crud -i --namespace cje --set image.tag=${version}-${commitHash}"
                   }
            }
              }
            
        
    }
}
