angular.module("umbraco")
    .controller("MediaProtect.Dashboard.IndexDashboardController",
    function ($scope, mediaprotectBackofficeResources, notificationsService) {

        $scope.bindData = function () {
            mediaprotectBackofficeResources.indexStatus().then(function (res) {
                $scope.model = res.data;
                $scope.loaded = true;
            });
        };
        $scope.reindex = function () {
            $scope.reindexing = true;
            mediaprotectBackofficeResources.rebuildIndex().then(function (res) {
                $scope.model = res.data;
                $scope.reindexing = false;
                notificationsService.success($scope.model.reindexStatusHeader, $scope.model.reindexStatusMessage);
            });
        };

        //Initialize
        $scope.bindData();
    });
angular.module("umbraco")
    .controller("MediaProtect.Dashboard.LogviewerController",
    function ($scope, mediaprotectBackofficeResources,mediaprotectHelper, notificationsService) {

        $scope.pageNumber = 1;
        $scope.searchTerm = '';

        $scope.bindData = function () {
            mediaprotectBackofficeResources.getLogEntries($scope.searchTerm, $scope.pageNumber).then(function (res) {
                $scope.model = res.data;
                $scope.loaded = true;
            });
        };

        $scope.filter = function (q) {
            $scope.searchTerm = q;
            $scope.pageNumber = 1;
            $scope.bindData();
        }

        $scope.gotoPage = function (pageNumber) {
            $scope.pageNumber = pageNumber;
            $scope.bindData();
        }

        $scope.refresh = function () {
            $scope.pageNumber = 1;
            $scope.searchTerm = '';
            $scope.bindData();
        }

        $scope.clearLog = function () {
            if (confirm($scope.model.deleteLogMessage)) {
                mediaprotectBackofficeResources.clearLog().then(function (data) {
                    $scope.bindData();
                });
            }
        }

        $scope.exportData = function () {

            var url = mediaprotectBackofficeResources.exportData();
            mediaprotectHelper.downloadFile(url);
        }


        //Initialize
        $scope.bindData();
    });
angular.module("umbraco")
    .controller("MediaProtect.Dialogs.ProtectController",
    function ($scope,$q, mediaprotectBackofficeResources, editorService, notificationsService, navigationService,memberGroupResource,memberResource) {

        $scope.selectedProtectionMode = 'RoleProtection';
        $scope.selectedAvailableoptions = [];
        $scope.members = [];
        $scope.notselectedAvailableoptions = [];
        $scope.errorMessages = [];
        $scope.showRemoveDialog = false;
        navigationService.allowHideDialog(false);

        $scope.bindData = function () {
            mediaprotectBackofficeResources.initializeDialogResource($scope.currentNode.id).then(function (res) {
                $scope.initializeGroups();
                $scope.model = res.data;
                $scope.initializeMembers();
                $scope.loaded = true;
            },
                function (data) {
                    $scope.loaded = true;
                    $scope.errorState = true;
                });
        };

        $scope.close = function () {
            navigationService.allowHideDialog(true);
            navigationService.hideDialog();
        }

        $scope.pickGroup = function () {
            editorService.memberGroupPicker({
                multiPicker: true,
                submit: function submit(model) {
                    var selectedGroupIds = model.selectedMemberGroups ? model.selectedMemberGroups : [model.selectedMemberGroup];
                    _.each(selectedGroupIds, function (groupId) {
                        // find the group in the lookup list and add it if it isn't already
                        var group = _.find($scope.allGroups, function (g) {
                            return g.id === parseInt(groupId);
                        });
                        if (group && !_.find($scope.groups, function (g) {
                            return g.id === group.id;
                        })) {
                            $scope.model.groups.push(group);
                        }
                    });
                    editorService.close();
                },
                close: function close() {
                    editorService.close();
                    
                }
            });
        }

        $scope.removeGroup = function (group) {
            $scope.model.groups = _.reject($scope.model.groups, function (g) {
                return g.id === group.id;
            });
        }

        $scope.pickMember =  function () {
                editorService.treePicker({
                    multiPicker: true,
                    entityType: 'Member',
                    section: 'member',
                    treeAlias: 'member',
                    filter: function filter(i) {
                        return i.metaData.isContainer;
                    },
                    filterCssClass: 'not-allowed',
                    submit: function submit(model) {
                        if (model.selection && model.selection.length) {
                            var promises = [];
                            _.each(model.selection, function (member) {
                                promises.push(memberResource.getByKey(member.key).then(function (newMember) {
                                    if (!_.find($scope.model.members, function (currentMember) {
                                            return currentMember.username === newMember.username;
                                    })) {
                                        $scope.members.push(newMember);
                                        $scope.model.members.push(newMember.username);
                                    }
                                }));
                            });
                            editorService.close();
                            $scope.loading = true;
                            $q.all(promises).then(function () {
                                $scope.loading = false;
                            });
                        }
                    },
                    close: function close() {
                        editorService.close();
                    }
                });
            }
        $scope.removeMember = function (member) {
                $scope.members = _.without($scope.members, member);
                $scope.model.members = _.without($scope.model.members, member.username);
            }

        $scope.pickLoginPage =  function() {
            pickPage($scope.model.loginPage);
        }

        $scope.pickErrorPage =  function () {
            pickPage($scope.model.errorPage);
        }
        function pickPage(page) {
            editorService.contentPicker({
                submit: function submit(model) {
                    if (page === $scope.model.loginPage) {
                        $scope.model.loginPage = model.selection[0];
                    } else {
                        $scope.model.errorPage = model.selection[0];
                    }
                    editorService.close();
                },
                close: function close() {
                    editorService.close();
                }
            });
        }
        $scope.select = function () {
            $scope.model.dialogState = $scope.selectedProtectionMode;
            if ($scope.model.dialogState === "RoleProtection") {
                $scope.loading = true;
                $scope.initializeGroups();
            }
        }

        $scope.initializeGroups = function() {
            memberGroupResource.getGroups().then(function (groups) {
                $scope.allGroups = groups;
                $scope.hasGroups = groups.length > 0;
                $scope.loading = false;
            });
        }

        $scope.initializeMembers = function () {
            mediaprotectBackofficeResources.initializeDialogMembers($scope.model.members).then(function (result) {
                $scope.members = result.data;
            });
        }

        $scope.removeProtection = function() {
            $scope.showRemoveDialog = true;
        }

        $scope.cancelRemoveProtection = function () {
            $scope.showRemoveDialog = false;
        }

        $scope.performRemoveProtection = function () {
            mediaprotectBackofficeResources.removeProtection($scope.model).then(function (res) {
                notificationsService.success(res.data.header, res.data.description);
                navigationService.syncTree({ tree: "media", path: $scope.model.nodePath.split(","), forceReload: true });
                navigationService.allowHideDialog(true);
                navigationService.hideDialog();
            });
        }
        $scope.selectLoginNode = function () {
            editorService.contentPicker({
                multiPicker: false,
                callback: function (data) {
                    $scope.model.loginNodeId = data.id;
                    $scope.model.loginNodeName = data.name;
                }
            });
        };

        $scope.selectNoRightsNode = function () {
            editorService.contentPicker({
                multiPicker: false,
                callback: function (data) {
                    $scope.model.noRightsNodeId = data.id;
                    $scope.model.noRightsNodeName = data.name;
                }
            });
        };

        $scope.validateForm = function (callback) {
            mediaprotectBackofficeResources.validate($scope.model).then(function (res) {
                $scope.errorMessages = res.data.errorMessages;
                if (res.data.isValid) {
                    callback();
                } 
            });
        }

        $scope.save = function () {
            $scope.validateForm($scope.doSave);
        }

        $scope.doSave = function () {
                mediaprotectBackofficeResources.save($scope.model).then(function (res) {
                    notificationsService.success(res.data.header, res.data.description);
                    navigationService.syncTree({ tree: "media", path: $scope.model.nodePath.split(","), forceReload: true });
                    $scope.closeDialog();
                    mediaprotectBackofficeResources.reIndex($scope.model.nodeId);
                });
        }
        $scope.closeDialog = function() {
            navigationService.allowHideDialog(true);
            navigationService.hideDialog();
        }
        //Initialize
        $scope.bindData();
    });
angular.module("umbraco.resources")
    .factory("mediaprotectBackofficeResources", function ($http) {
        return {
            //LicenseInfo
            getLicenseInfo: function () {
                return $http.get("backoffice/mediaprotect/mediaprotectlicenseinfoapi/licenseinfo");
            },
            //ResourceService
            initializeResource: function () {
                return $http.get("backoffice/mediaprotect/mediaprotectlocalizationapi/initialize");
            },
            //Dialog resources
            initializeDialogResource: function (nodeId) {

                return $http.get('backoffice/mediaprotect/mediaprotectdialogapi/initialize', { params: { nodeId: nodeId} });
            },
            //Dialog resources
            initializeDialogMembers: function (members) {

                return $http({
                    method: 'POST',
                    data: JSON.stringify(members),
                    url: 'backoffice/mediaprotect/mediaprotectdialogapi/initializeMembers'
                });
            },
            save: function (dialogInfo) {

            return $http({
                method: 'POST',
                data: JSON.stringify(dialogInfo),
                url: 'backoffice/mediaprotect/mediaprotectdialogapi/save'
                });
            },
            validate: function (dialogInfo) {

                return $http({
                    method: 'POST',
                    data: JSON.stringify(dialogInfo),
                    url: 'backoffice/mediaprotect/mediaprotectdialogapi/validate'
                });
            },
            removeProtection: function (dialogInfo) {

                return $http({
                    method: 'POST',
                    data: JSON.stringify(dialogInfo),
                    url: 'backoffice/mediaprotect/mediaprotectdialogapi/removeprotection'
                });
            },
            rebuildIndex: function () {
                return $http.post("backoffice/mediaprotect/mediaprotectindexapi/rebuild");
            },
            reIndex: function (nodeId) {
                return $http({
                    method: 'POST',
                    params: { nodeId: nodeId} ,
                    url: 'backoffice/mediaprotect/mediaprotectindexapi/reindex'
                });
            },
            indexStatus: function () {
                return $http.get("backoffice/mediaprotect/mediaprotectindexapi/status");
            },
            getLogEntries: function (searchTerm, currentPage) {

                return $http.get('backoffice/mediaprotect/mediaprotectlogapi/getall', { params: { searchTerm: searchTerm, currentPage:currentPage } });
            },

            exportData: function () {
                return 'backoffice/mediaprotect/mediaprotectlogapi/export';
            },
            clearLog: function () {

                return $http.post('backoffice/mediaprotect/mediaprotectlogapi/clearlog');
            }
        };
    });
angular.module('umbraco.services')
.factory('mediaprotectHelper', function (notificationsService, navigationService, mediaprotectBackofficeResources, $timeout) {
    var service = {
        showNotification: function (notificationStatus) {
            if (notificationStatus.isError === false) {
                notificationsService.success(notificationStatus.header, notificationStatus.description);
            } else {
                notificationsService.error(notificationStatus.header, notificationStatus.description);
            }
        },
        showServerError: function () {
            notificationsService.error("Server error", "A server error occured");
        }
        ,
        applyValidationErrors: function (source, target) {
            target.isInValid = source.isInValid;
            target.validationMessages = source.validationMessages;
        }

        ,
        syncPath: function (path) {
            navigationService.syncTree({ tree: 'seochecker', path: path });
        },
        isSortDirection: function (columnName, sortDirection, currentSortColumn, currentSortDirection) {
            return columnName === currentSortColumn && sortDirection === currentSortDirection;
        }
        ,
        handleSelectAll: function (selected, items) {
            angular.forEach(items, function (item) {
                item.selected = selected;
            });
        }
          ,
        getSelectedItems: function (items) {
            var result = [];
            angular.forEach(items, function (item) {
                if (item.selected === true) {
                    result.push(item);
                }
            }
          );
            return result;
        },
        anyItemSelected: function (items) {
            var result = false;

            angular.forEach(items, function (item) {
                if (item.selected === true) {
                    result = true;
                    return;
                }
            }
           );
            return result === true;
        },
        downloadFile: function (url) {
            var fileExport = document.createElement('a');
            fileExport.id = "downloadframe";
            fileExport.style.display = 'none';
            document.body.appendChild(fileExport);
            fileExport.href = url;
            fileExport.click();
            //remove all traces
            $timeout(function () {
                document.body.removeChild(fileExport);
            }, 1000);
        }
        ,
        uploadFiles: function (folder, fileCollection) {
            var formData = new FormData();
            formData.append("folderName", folder);
            formData.append("uploadfiles", fileCollection);
            
            return seocheckerBackofficeResources.uploadFiles(formData).then(function success(response) {
              return response.data;

          }, function error(response) {

              notificationsService.error(response.data);
          });
        }
          ,
        getTabByName: function (tabs, name) {
            for (var i = 0; i < tabs.length; i++) {
                if (tabs[i].alias === name) {
                    return tabs[i];
                }
            }

            //just return an empty tab when nothing is found
            return {
                active: false,
                alias: 'emptyTab',
                id: -1,
                label: 'empty',
                properties:[]
            };
        }
         ,
        updateTab: function (oldModel, newModel, tabName) {

            var newtab = service.getTabByName(newModel.tabs, tabName);
            var oldTabs = service.getTabByName(oldModel.tabs, tabName);

            oldTabs.properties = newtab.properties;
        },
        isNullOrUndefined: function(val) {
            return  val === null || angular.isUndefined(val) ;
        },
        encodeHtmlBrackets: function(val) {
            if (!service.isNullOrUndefined(val)) {
                val = val.replace('<','&lt;');
                val = val.replace('>','&gt;');
            }
            return val;
        }
    };
    return service;
});

angular.module("umbraco.directives")
    .directive('mediaprotectLicenseinfo', function (mediaprotectBackofficeResources) {
        return {
            transclude: true,
            restrict: 'E',
            replace: true,
            link: function (scope, element) {
                mediaprotectBackofficeResources.getLicenseInfo().then(function (res) {
                    if (res.data.licenseError === true) {
                        element.html('<div class="alert alert-error mediaprotectLicenseInfo">' + res.data.licenseMessage + '</div>');
                    }
                    if (res.data.trialLicense === true) {
                        element.html('<div class="alert alert-warning mediaprotectLicenseInfo">' + res.data.licenseMessage + '</div>');
                    }
                });
            }
        };
    });