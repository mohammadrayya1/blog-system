node{
    git branch: "main", url:"https://github.com/mohammadrayya1/blog-system"

    stage("build"){
        try{
        sh' echo "Hello From Build stage"'
                }
                catch(Exception e){

                sh'echo "exeption"'
                throw e
                }
    }


    stage("test"){
        if(env.BRANCH_NAME=== 'featch '){
            sh'echo "test stage"'
        }
        else{
          sh'echo "skipt test stage"'
        }
    }
}