var _ = window.lodash;
var angular = window.angular;

angular.module('hackshop', [])
.controller('StepsController', [
  '$scope',
  '$window',
  '$http',
  '$q',
  function($scope, $window, $http, $q){

    $scope.selectedOwner = 'codefordenver';

    this.session = function(){
      return $window.Application.session;
    };

    this.createProject = function(options) {
      var name = options.name;
      var type = options.type;

      var me = this;
      me.failure = undefined;
      me.projectCreated = undefined;
      me.project = undefined;
      me.loading = true;

      me._getGitHubAccessToken()
        .then(function(githubAccessToken){
          return me.createRepo(name, githubAccessToken)
            .then(function(repo){
              return me.createLabels(repo, githubAccessToken)
                .then(function(){
                  return me.createReadme(repo, githubAccessToken);
                })
                .then(function() {
                  return me.createDefaultFiles(repo, githubAccessToken);
                })
                .then(function(){
                  return me.createWaffleProject(repo)
                    .then(function(project){
                      me.project = project;
                      return me.createCards(project, githubAccessToken, type)
                        .then(function(){
                          return me.orderCards(project);
                        });
                    });

                });
            });
        })
        .then(function(){
          me.loading = false;
          me.projectCreated = true;
        })
        .catch(function(err){
          me.loading = false;
          me.failure = err;
        });
    };

    this.createRepo = function(name, accessToken){
      var apiEndpoint;

      if ($scope.selectedOwner === 'personal') {
        apiEndpoint = 'https://api.github.com/user/repos';
      } else {
        apiEndpoint = 'https://api.github.com/orgs/' + $scope.selectedOwner + '/repos';
      }

      return $http({
        url: apiEndpoint,
        method: 'post',
        params: {
          access_token: accessToken
        },
        data: {
          name: name || 'cfd-new',
          description: 'New Code for Denver Project',
          homepage: ''
        }
      })
      .then(function(response){
        return response.data;
      });
    };

    this.createReadme = function(repo, accessToken){
      return $http.get('/contents/readme', {
        params: {
          repo: repo.full_name
        }
      })
      .then(function(response){
        var content = response.data;

        return $http({
          url: repo.url + '/contents/README.md',
          method: 'put',
          params: {
            access_token: accessToken
          },
          data: {
            message: 'Creating README for project',
            content: content,
            committer: {
              name: 'waffle-iron',
              email: 'iron@waffle.io'
            }
          }
        });
      });
    };

    this.createDefaultFiles = function(repo, accessToken){

      return $http.get('/contents/default-files')
        .then(function(response){
          var fileData = response.data;

          var promise = $q.when(true);

          _.each(fileData, function(file){
            promise = promise.then(function(){
              return $http({
                method: 'put',
                url: repo.url + '/contents/' + file.name,
                params: {
                  access_token: accessToken
                },
                data: {
                  message: 'Default Code for Denver ' + file.name,
                  content: file.content,
                  committer: {
                                // TODO: Update to not use the waffle-iron for our commits
                    name: 'waffle-iron',
                    email: 'iron@waffle.io'
                  }
                }
              });
            });
          });

          return promise;
        });
    };

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
    };

    this.createCards = function(project, githubAccessToken, type){
      var user = this.session();
      var waffleAccessToken = user.accessToken;

      return $http.get('/contents/cards', {
        params: {
          type: type
        }
      })
      .then(function(response){
        var cards = response.data;

        function createCard(card){
          return $http({
            method: 'post',
            url: 'https://api.waffle.io/' + project.name + '/cards',
            params: {
              access_token: waffleAccessToken
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

        var promise = createCard(cards.shift());

        _.each(cards, function(card){
          promise = promise.then(function(){
            return createCard(card);
          });
        });

        return promise;
      });
    };

    this.createLabels = function(repo, githubAccessToken){
      var labels = [
        {name: 'blocked', color: 'e11d21'},
        {name: 'validated', color: '5319e7'},
        {name: 'invalidated', color: 'fbca04'},
        {name: 'design needed', color: 'eb6420'},
        {name: 'dev needed', color: 'bfd4f2'},
        {name: 'sprint 1', color: 'ddd1e7'},
        {name: 'sprint 2', color: 'bba3d0'},
        {name: 'sprint 3', color: '9975b9'},
        {name: 'sprint 4', color: '7647a2'},
        {name: 'sprint 5', color: '551a8b'}
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

      var promises = _.map(labels, function(label){
        return createLabel(label);
      });

      return $q.all(promises);
    };

    this.orderCards = function(project){
      var user = this.session();

      return $http.get('https://api.waffle.io/' + project.name + '/cards', {
        params: {
          access_token: user.accessToken
        }
      })
      .then(function(response){
        var cards = response.data;

        var sortedCards = _.sortBy(cards, function(card){
          return card.githubMetadata.number;
        });
        sortedCards.reverse();

        var promise = $q.when(true);

        _.each(sortedCards, function(card){
          card.rank = 'top';

          promise = promise.then(function(){
            return $http({
              method: 'put',
              url: 'https://api.waffle.io/cards/' + card._id,
              params: {
                access_token: user.accessToken
              },
              data: card
            });
          });
        });

        return promise;
      });
    };

    this._getGitHubAccessToken = function(){
      var user = this.session();
      var waffleAccessToken = user.accessToken;
      return $http.get('https://api.waffle.io/user', {
        params: {
          access_token: waffleAccessToken
        }
      })
      .then(function(response){
        user = response.data;

        return $http.get('https://api.waffle.io/providers', {
          params: {
            access_token: waffleAccessToken
          }
        })
        .then(function(response){
          var providers = response.data;
          var githubProvider = _.find(providers, function(provider){
            return provider.baseUrl === 'https://github.com';
          });

          var githubAccessToken = _.find(user.credentials, function(cred){
            return cred.provider === githubProvider._id;
          }).accessToken;

          return githubAccessToken;
        });
      });
    };
  }
]);
