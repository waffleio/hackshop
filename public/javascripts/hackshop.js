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
            me.failure = undefined;
            me.projectCreated = undefined;
            me.project = undefined;
            me.loading = true;

            me._getGitHubAccessToken()
            .then(function(githubAccessToken){

                return me.createRepo(name, githubAccessToken)
                .then(function(repo){
                    return me.createReadme(repo, githubAccessToken)
                    .then(function(){
                        return me.createWaffleProject(repo)
                        .then(function(project){
                            me.project = project;
                            return me.createCards(project, githubAccessToken);
                        })
                        .then(function(){
                            return me.createLabels(repo, githubAccessToken);
                        })
                    })
                })
            })

            .then(function(){
                me.loading = false;
                me.projectCreated = true;
            })
            .catch(function(err){
                me.loading = false;
                me.failure = err;
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

        this.createWaffleProject = function(repo){
            var user = this.session();

            return $http({
                method: 'post',
                url: 'https://api.waffle.io/projects',
                params: {
                    access_token: user.accessToken
                },
                data: {
                    name: repo.full_name
                }
            })
            .then(function(response){
                return response.data;
            });

        }

        this.createCards = function(project, githubAccessToken){
            var user = this.session();

            return $http.get('/contents/cards')
            .then(function(response){
                cards = response.data;

                function createCard(card){
                    return $http({
                        method: 'post',
                        url: 'https://api.waffle.io/' + project.name + '/cards',
                        params: {
                            access_token: user.accessToken
                        },
                        data: {
                            githubMetadata: {
                                labels: card.labels || [],
                                milestone: null,
                                source: project.sources[0]._id,
                                title: card.title,
                                body: card.description
                            }
                        }
                    });
                }

                promise = createCard(cards.shift());

                _.each(cards, function(card){
                    promise = promise.then(function(){
                        return createCard(card);
                    })
                })
            })
        }

        this.createLabels = function(repo, githubAccessToken){
            var labels = [
                {name: 'experiment', color: '009ACD'},
                {name: 'build', color: '009800'},
                {name: 'measure', color: 'eb6420'},
                {name: 'learn', color: 'cc317c'},
                {name: 'blocked', color: 'e11d21'},
                {name: 'validated', color: '5319e7'},
                {name: 'invalidated', color: 'fbca04'},
                {name: 'customer dev', color: '0052cc'},
                {name: 'dev needed', color: 'bfd4f2'},
                {name: 'design needed', color: 'f7c6c7'}
            ];


            function createLabel(label){
                return $http({
                    method: 'post',
                    url: repo.url + '/labels',
                    data: label,
                    params: {
                        access_token: githubAccessToken
                    }
                });
            }

            promise = createLabel(labels.shift());

            _.each(labels, function(label){
                promise = promise.then(function(){
                    return createLabel(label);
                });
            });

            return promise;

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
