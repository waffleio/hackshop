angular.module('hackshop', [])

.controller('StepsController', [
    '$window',
    '$http',
    function($window, $http){

        this.session = function(){
            return $window.Application.session;
        }

        this.createProject = function(name) {
            var me = this;

            me._getGitHubAccessToken()
            .then(function(githubAccessToken){
                
                return me.createRepo(name, githubAccessToken)
                .then(function(repo){
                    return me.createReadme(repo, githubAccessToken);
                })
            })

            .then(function(){
                console.log('done!');
            })
        }

        this.createRepo = function(name, accessToken){
            var user = this.session();
            var me = this;

            return $http({
                url: 'https://api.github.com/user/repos',
                method: 'post',
                params: {
                    access_token: accessToken
                },
                data: {
                    name: name || 'hackshop',
                    description: 'Waffle Hackshop: a board in Waffle.io with cards for each action you should do to kickoff a project.',
                    homepage: 'https://hackshop.waffle.io'
                }
            })
            .then(function(response){
                return response.data;
            })
            
        }

        this.createReadme = function(repo, accessToken){

            return $http.get('/contents/readme')
            .then(function(response){
                content = response.data;
                
                return $http({
                    url: repo.url + '/contents/README.md',
                    method: 'put',
                    params: {
                        access_token: accessToken
                    },
                    data: {
                        message: 'Creating README with hackshop instructions',
                        content: content,
                        committer: {
                            name: 'waffle-iron',
                            email: 'iron@waffle.io'
                        }
                    }
                
                })
            })
        }

        this._getGitHubAccessToken = function(){
            user = this.session();
            return $http.get('https://api.waffle.io/providers', {
                params: {
                    access_token: user.accessToken
                }
            })
            .then (function(response){
                providers = response.data;
                githubProvider = _.find(providers, function(provider){
                    return provider.baseUrl === 'https://github.com';
                });

                githubAccessToken = _.find(user.credentials, function(cred){
                    return cred.provider === githubProvider._id;
                }).accessToken;

                return githubAccessToken;
            });
        }
    }
]);