node {
    git branch: "main", url: "https://github.com/mohammadrayya1/blog-system"

    stage("build") {
        try {
            sh 'echo "Hello From Build stage"'
        } catch (Exception e) {
            sh 'echo "exception happened"'
            throw e
        }
    }

    stage("test") {
        if (env.BRANCH_NAME == 'feature') {
            sh 'echo "test stage"'
        } else {
            sh 'echo "skip test stage"'
        }
    }
}
