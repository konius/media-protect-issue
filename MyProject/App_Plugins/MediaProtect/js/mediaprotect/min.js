angular.module("umbraco").controller("MediaProtect.Dashboard.IndexDashboardController",function(n,t,i){n.bindData=function(){t.indexStatus().then(function(t){n.model=t.data;n.loaded=!0})};n.reindex=function(){n.reindexing=!0;t.rebuildIndex().then(function(t){n.model=t.data;n.reindexing=!1;i.success(n.model.reindexStatusHeader,n.model.reindexStatusMessage)})};n.bindData()});angular.module("umbraco").controller("MediaProtect.Dashboard.LogviewerController",function(n,t,i){n.pageNumber=1;n.searchTerm="";n.bindData=function(){t.getLogEntries(n.searchTerm,n.pageNumber).then(function(t){n.model=t.data;n.loaded=!0})};n.filter=function(t){n.searchTerm=t;n.pageNumber=1;n.bindData()};n.gotoPage=function(t){n.pageNumber=t;n.bindData()};n.refresh=function(){n.pageNumber=1;n.searchTerm="";n.bindData()};n.clearLog=function(){confirm(n.model.deleteLogMessage)&&t.clearLog().then(function(){n.bindData()})};n.exportData=function(){var n=t.exportData();i.downloadFile(n)};n.bindData()});angular.module("umbraco").controller("MediaProtect.Dialogs.ProtectController",function(n,t,i,r,u,f,e,o){function s(t){r.contentPicker({submit:function(i){t===n.model.loginPage?n.model.loginPage=i.selection[0]:n.model.errorPage=i.selection[0];r.close()},close:function(){r.close()}})}n.selectedProtectionMode="RoleProtection";n.selectedAvailableoptions=[];n.members=[];n.notselectedAvailableoptions=[];n.errorMessages=[];n.showRemoveDialog=!1;f.allowHideDialog(!1);n.bindData=function(){i.initializeDialogResource(n.currentNode.id).then(function(t){n.initializeGroups();n.model=t.data;n.initializeMembers();n.loaded=!0},function(){n.loaded=!0;n.errorState=!0})};n.close=function(){f.allowHideDialog(!0);f.hideDialog()};n.pickGroup=function(){r.memberGroupPicker({multiPicker:!0,submit:function(t){var i=t.selectedMemberGroups?t.selectedMemberGroups:[t.selectedMemberGroup];_.each(i,function(t){var i=_.find(n.allGroups,function(n){return n.id===parseInt(t)});i&&!_.find(n.groups,function(n){return n.id===i.id})&&n.model.groups.push(i)});r.close()},close:function(){r.close()}})};n.removeGroup=function(t){n.model.groups=_.reject(n.model.groups,function(n){return n.id===t.id})};n.pickMember=function(){r.treePicker({multiPicker:!0,entityType:"Member",section:"member",treeAlias:"member",filter:function(n){return n.metaData.isContainer},filterCssClass:"not-allowed",submit:function(i){if(i.selection&&i.selection.length){var u=[];_.each(i.selection,function(t){u.push(o.getByKey(t.key).then(function(t){_.find(n.model.members,function(n){return n.username===t.username})||(n.members.push(t),n.model.members.push(t.username))}))});r.close();n.loading=!0;t.all(u).then(function(){n.loading=!1})}},close:function(){r.close()}})};n.removeMember=function(t){n.members=_.without(n.members,t);n.model.members=_.without(n.model.members,t.username)};n.pickLoginPage=function(){s(n.model.loginPage)};n.pickErrorPage=function(){s(n.model.errorPage)};n.select=function(){n.model.dialogState=n.selectedProtectionMode;n.model.dialogState==="RoleProtection"&&(n.loading=!0,n.initializeGroups())};n.initializeGroups=function(){e.getGroups().then(function(t){n.allGroups=t;n.hasGroups=t.length>0;n.loading=!1})};n.initializeMembers=function(){i.initializeDialogMembers(n.model.members).then(function(t){n.members=t.data})};n.removeProtection=function(){n.showRemoveDialog=!0};n.cancelRemoveProtection=function(){n.showRemoveDialog=!1};n.performRemoveProtection=function(){i.removeProtection(n.model).then(function(t){u.success(t.data.header,t.data.description);f.syncTree({tree:"media",path:n.model.nodePath.split(","),forceReload:!0});f.allowHideDialog(!0);f.hideDialog()})};n.selectLoginNode=function(){r.contentPicker({multiPicker:!1,callback:function(t){n.model.loginNodeId=t.id;n.model.loginNodeName=t.name}})};n.selectNoRightsNode=function(){r.contentPicker({multiPicker:!1,callback:function(t){n.model.noRightsNodeId=t.id;n.model.noRightsNodeName=t.name}})};n.validateForm=function(t){i.validate(n.model).then(function(i){n.errorMessages=i.data.errorMessages;i.data.isValid&&t()})};n.save=function(){n.validateForm(n.doSave)};n.doSave=function(){i.save(n.model).then(function(t){u.success(t.data.header,t.data.description);f.syncTree({tree:"media",path:n.model.nodePath.split(","),forceReload:!0});n.closeDialog();i.reIndex(n.model.nodeId)})};n.closeDialog=function(){f.allowHideDialog(!0);f.hideDialog()};n.bindData()});angular.module("umbraco.resources").factory("mediaprotectBackofficeResources",function(n){return{getLicenseInfo:function(){return n.get("backoffice/mediaprotect/mediaprotectlicenseinfoapi/licenseinfo")},initializeResource:function(){return n.get("backoffice/mediaprotect/mediaprotectlocalizationapi/initialize")},initializeDialogResource:function(t){return n.get("backoffice/mediaprotect/mediaprotectdialogapi/initialize",{params:{nodeId:t}})},initializeDialogMembers:function(t){return n({method:"POST",data:JSON.stringify(t),url:"backoffice/mediaprotect/mediaprotectdialogapi/initializeMembers"})},save:function(t){return n({method:"POST",data:JSON.stringify(t),url:"backoffice/mediaprotect/mediaprotectdialogapi/save"})},validate:function(t){return n({method:"POST",data:JSON.stringify(t),url:"backoffice/mediaprotect/mediaprotectdialogapi/validate"})},removeProtection:function(t){return n({method:"POST",data:JSON.stringify(t),url:"backoffice/mediaprotect/mediaprotectdialogapi/removeprotection"})},rebuildIndex:function(){return n.post("backoffice/mediaprotect/mediaprotectindexapi/rebuild")},reIndex:function(t){return n({method:"POST",params:{nodeId:t},url:"backoffice/mediaprotect/mediaprotectindexapi/reindex"})},indexStatus:function(){return n.get("backoffice/mediaprotect/mediaprotectindexapi/status")},getLogEntries:function(t,i){return n.get("backoffice/mediaprotect/mediaprotectlogapi/getall",{params:{searchTerm:t,currentPage:i}})},exportData:function(){return"backoffice/mediaprotect/mediaprotectlogapi/export"},clearLog:function(){return n.post("backoffice/mediaprotect/mediaprotectlogapi/clearlog")}}});angular.module("umbraco.services").factory("mediaprotectHelper",function(n,t,i,r){var u={showNotification:function(t){t.isError===!1?n.success(t.header,t.description):n.error(t.header,t.description)},showServerError:function(){n.error("Server error","A server error occured")},applyValidationErrors:function(n,t){t.isInValid=n.isInValid;t.validationMessages=n.validationMessages},syncPath:function(n){t.syncTree({tree:"seochecker",path:n})},isSortDirection:function(n,t,i,r){return n===i&&t===r},handleSelectAll:function(n,t){angular.forEach(t,function(t){t.selected=n})},getSelectedItems:function(n){var t=[];return angular.forEach(n,function(n){n.selected===!0&&t.push(n)}),t},anyItemSelected:function(n){var t=!1;return angular.forEach(n,function(n){if(n.selected===!0){t=!0;return}}),t===!0},downloadFile:function(n){var t=document.createElement("a");t.id="downloadframe";t.style.display="none";document.body.appendChild(t);t.href=n;t.click();r(function(){document.body.removeChild(t)},1e3)},uploadFiles:function(t,i){var r=new FormData;return r.append("folderName",t),r.append("uploadfiles",i),seocheckerBackofficeResources.uploadFiles(r).then(function(n){return n.data},function(t){n.error(t.data)})},getTabByName:function(n,t){for(var i=0;i<n.length;i++)if(n[i].alias===t)return n[i];return{active:!1,alias:"emptyTab",id:-1,label:"empty",properties:[]}},updateTab:function(n,t,i){var r=u.getTabByName(t.tabs,i),f=u.getTabByName(n.tabs,i);f.properties=r.properties},isNullOrUndefined:function(n){return n===null||angular.isUndefined(n)},encodeHtmlBrackets:function(n){return u.isNullOrUndefined(n)||(n=n.replace("<","&lt;"),n=n.replace(">","&gt;")),n}};return u});angular.module("umbraco.directives").directive("mediaprotectLicenseinfo",function(n){return{transclude:!0,restrict:"E",replace:!0,link:function(t,i){n.getLicenseInfo().then(function(n){n.data.licenseError===!0&&i.html('<div class="alert alert-error mediaprotectLicenseInfo">'+n.data.licenseMessage+"<\/div>");n.data.trialLicense===!0&&i.html('<div class="alert alert-warning mediaprotectLicenseInfo">'+n.data.licenseMessage+"<\/div>")})}}});