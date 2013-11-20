'use strict'
Q = require "q"
fs = require "fs"
path = require "path"
mime = require "mime"
XMLHttpRequest = require("w3c-xmlhttprequest").XMLHttpRequest

merge = utils.merge
logger = require("usco-kernel/logger")
logger.level = "debug"

class YouMagineStore
  constructor:(options)->
    options = options or {}
    defaults =
      enabled: (if process? then true else false)
      name:"YouMagine"
      type:"YouMagineStore",
      description: "Youmagine: Share your imagination"
      rootUri:if process? then process.env.HOME or process.env.HOMEPATH or process.env.USERPROFILE else null
      isDataDumpAllowed: false
      showPaths:true
      #additional    
      token: null
      apiURL: "http://api.youmagine.com"
      checkForTokenPID: null
      checkForTokenTimes: 30
      checkForTokenTimesLeft: 30
      checkForTokenInterval: 1000
      designOnline: []
    
    options = merge defaults, options
    super options
    ###
    #FIXME@vent.on("project:saved",@pushSavedProject)
    ###
  
  login:=>
      logger.debug "youmagine logging in..."
      login_succeeded = false
      @authCheck()
      if @token isnt null
        logger.debug "There's a token cookie (#{@token}). Welcome #{@screen_name}!"
        logger.debug "does the token work?"
        @listDesigns() #FIXME ????
      else
          @authRequestWindow=window.open('http://www.youmagine.com/integrations/ultishaper/authorized_integrations/new?redirect_url=http://localhost:3000/youmagine/get_token&deny_url=http://localhost:3000/youmagine/get_token','','width=450,height=500')
          @authRequestWindow.focus()
          window.clearInterval @checkForTokenPID 
          @checkForTokenPID = window.setInterval(@receiveTokenMessage, @checkForTokenInterval)
          console.log @checkForTokenPID

  authCheck:=>
    logger.info "youmagine authCheck"
    @token = $.cookie 'youmagine_token'
    @username = $.cookie 'youmagine_user'
    @user_id = $.cookie 'youmagine_user_id'
    @screen_name = $.cookie 'youmagine_screen_name'
    if @token isnt null
      logger.debug "There's a token cookie (#{@token}). Welcome #{@screen_name}!"
      logger.debug "does the token work?"
    # @loggedIn = true
    if @loggedIn != true
      console.log "youmagine login failed."
        
  logout:=>
    logger.info "youmagine logging out..."
    $.cookie("youmagine_token",null);
    $.cookie("youmagine_user",null);
    $.cookie("youmagine_user_id",null);
    @loggedIn = false
    logger.info "youmagine logged out"

  receiveTokenMessage:=>
    if --@checkForTokenTimesLeft <= 0
      console.log "I've been trying to connect to Youmagine for #{@checkForTokenTimes} seconds. Giving up."
      window.clearInterval @checkForTokenPID
      @checkForTokenTimesLeft = @checkForTokenTimes

    console.log "do I have a token???"
    @token = $.cookie 'youmagine_token'
    if @token is null
      console.log "token is null"
    else
      console.log "token recieved. Done."
      if typeof @authRequestWindow is "object" && @authRequestWindow.close
        @authRequestWindow.location.href = '/youmagine/connect_success';
      if @listDesigns() is false
        console.log "receiveTokenMessage(): Couldnt list designs. Cant use Youmagine."
      else @loggedIn = true
      window.clearInterval @checkForTokenPID

  ###-------------------file/folder manipulation methods----------------###
  
  ###*
  * list all elements inside the given uri (non recursive)
  * @param {String} uri the folder whose content we want to list
  * @return {Object} a promise, that gets resolved with the content of the uri
  ###
  list:( uri )=>
    deferred = Q.defer()
    return deferred.promise
  
  ###*
  * read the file at the given uri, return its content
  * @param {String} uri absolute uri of the file whose content we want
  * @param {String} encoding the encoding used to read the file
  * @return {Object} a promise, that gets resolved with the content of file at the given uri
  ###
  read:( uri , encoding )=>
    #todo: auto switch internals based on requested data type
    #documents: http://api.youmagine.com/designs/{slug|id}/documents.json?auth_token={token}
    #single document : http://api.youmagine.com/documents/{id}.json?auth_token={token}
    #todo: check if there is an auth_token already , if not , add the one we have

    if "documents" in uri:

    logger.info "fetching file from youmagine"
    encoding = encoding or 'utf8'
    deferred = Q.defer()
    request = new XMLHttpRequest()
    

    # TODO replace with URL: http://api.youmagine.com/documents/{id}/download
    #uri = http://api.youmagine.com/documents/#{id}/download
    uri = "http://my.ultimaker.net/tests/myproxy/?url=" + escape( fileName )
    request.open( 'GET', uri, true );
    
    onLoad= ( event )=>
      #console.log "xhr success", event.target.responseText
      result = event.target.responseText
      serializer = new XMLSerializer() #FIXME: needed ???
      result = serializer.serializeToString(result)
      logger.debug "fetched list: ", result
      deferred.resolve( result )
    
    onProgress= ( event )=>
      if (event.lengthComputable)
        percentComplete = (event.loaded/event.total)*100
        logger.debug "percent", percentComplete
        deferred.notify( percentComplete )
    
    onError= ( event )=>
      deferred.reject(event)
    
    request.addEventListener 'load', onLoad, false
    request.addEventListener 'loadend', onLoad, false
    request.addEventListener 'progress', onProgress, false
    request.addEventListener 'error', onError, false
    
    request.send()
    return deferred.promise
  
  ###*
  * write the file at the given uri, with the given data, using given mimetype
  * @param {String} uri absolute uri of the file we want to write (if the intermediate directories do not exist, they get created)
  * @param {String} data the content we want to write to the file
  * @param {String} type the mime-type to use
  * @return {Object} a promise, that gets resolved with "true" if writing to the file was a success, the error in case of failure
  ###
  write:( uri, data, type, overwrite )=>
    type = type or 'utf8' #mime.charsets.lookup()
    overwrite = overwrite or true
    deferred = Q.defer()
    return deferred.promise
  
  ###*
  * move/rename the item at first uri to the second uri
  * @param {String} uri absolute uri of the source file or folder
  * @param {String} newuri absolute uri of the destination file or folder
  * @param {Boolean} whether to allow overwriting or not (defaults to false)
  * @return {Object} a promise, that gets resolved with "true" if moving/renaming the file was a success, the error in case of failure
  ###
  move:( uri, newUri , overwrite)=>
    overwrite = overwrite or false
    deferred = Q.defer()
    return deferred.promise
  
  #Helpers
  
  #checks if specified project /project uri exists
  isProject:( uri )=>
    if fs.existsSync( uri )
      stats = fs.statSync( uri )
      if stats.isDirectory()
        codeExtensions = ["coffee", "litcoffee", "js", "usco", "ultishape"] #TODO: REDUNDANT with modules! where to put this
        for ext in codeExtensions
          baseName = path.basename( uri )
          mainFile = path.join( uri, baseName + "." + ext )
          if fs.existsSync( mainFile )
            return true
    return false

###old stuff
    setLoggedIn:=>
    @loggedIn = true
    window.clearInterval @checkForTokenPID
    @vent.trigger("YouMagineStore:loggedIn")
  listDesigns:=>
      console.log "listing your Designs on YouMagine from API #{@apiURL}"
      # Possibly, the following line is not needed:
      # jQuery.ajaxSetup {headers: {"X-Requested-With": "XMLHttpRequest"}}
      that = @
      req = $.getJSON "#{@apiURL}/designs.json", {auth_token:@token}, (data, resp) =>
        @listDesignsCallback data
      # @listDesignsCallback(data)
      # `$.getJSON("#{@apiURL}/designs.json?auth_token=dYhhiT2h9ZSghBAYsb5C", function(data) { console.log(data); })`

  listDesignsCallback:(data)=>
    console.log "listDesignsCallback()"
    @designOnline = data
    console.log data
    if data.length
      @setLoggedIn()
    else
      if @loggedIn == false
        @authRequestWindow=window.open('http://www.youmagine.com/integrations/ultishaper/authorized_integrations/new?redirect_url=http://localhost:3000/youmagine/get_token&deny_url=http://localhost:3000/youmagine/get_token','','width=450,height=500')
        @authRequestWindow.focus()
        window.clearInterval @checkForTokenPID 
        @checkForTokenPID = window.setInterval(@receiveTokenMessage, @checkForTokenInterval)
        console.log @checkForTokenPID
  
    getProjectsName:(callback)=>
      try
        projectsList = localStorage.getItem("#{@storeURI}")
        console.log "browser store projects", projectsList,"storeURI", "#{@storeURI}"
        if projectsList
          projectsList = projectsList.split(',')
        else
          projectsList = []
        @projectsList = projectsList
        console.log "projectsList: =========",projectsList
        for design in @designOnline
          # console.log design.slug
          projectsList.unshift design.slug
        @_getAllProjectsHelper()
        #kept for now
        ### 
        projectNames = []
        for model in @lib.models
          projectNames.push(model.id)
          @projectsList.push(model.id) 
        ### 
        
        callback(@projectsList)
      catch error
        console.log "could not fetch projectsName from #{@name} because of error #{error}"
    
    pushSavedProject:(project)=>
      # New function that's run after a save. Responds to project:saved
      console.log 'going to push project to youmagine.',project
      # jQuery.ajaxSetup({async:false});
      window.apiURL = @apiURL
      url = "#{window.apiURL}/designs.json?auth_token=#{@token}"
      url = "#{@apiURL}/designs/60.json?auth_token=#{@token}"
      # url = "#{@apiURL}/designs.json"
      # console.log "url = #{url}"
      window.auth_token = @token
      data =
        'design[name]': project.name
        'design[description]': 'Made with the <b>Ultishaper</b>!!'
        'design[license]': 'cc'

      filesList = project.rootFolder.models
      # use PUT for 're-saving'
      # use POST for 'adding a resource'

      type = 'PUT'
      req = $.ajax url, 
        data: data
        type: type
        success: (data, resp,jqXHRObj) ->
          console.log "#Response: #{resp} !!!!!!",data,jqXHRObj
          # if data.id?
          for index, file of filesList
            fileName = file.id
            fileContent = file.content
            ext = fileName.split('.').pop().toLowerCase()
            if ext isnt 'ultishape' && ext isnt 'png'
              console.log 'Phase 2: NOT UPLOADING:',fileName
            else
              console.log 'Phase 2: UPLOADING:',fileName
              dataB64 = []
              i = -1;


              console.log 'fileContent is a ' + typeof fileContent,'Content:',fileContent.substring(0,30)

              if ext is 'ultishape'
                while ( i++ < fileContent.length)
                  dataB64.push(fileContent.charAt(i))
                aBlob = new Blob(dataB64, {
                  type: 'application/xml'
                });
                entityType = 'documents'
                fd = new FormData
                fd.append('document[name]', fileName);
                # fd.append('document[filename]', fileName);
                fd.append('document[description]', 'The main UltiShaper design file.');
                fd.append('document[file]', aBlob,fileName);


              if ext is 'png'
                console.log 'b64toBlob'
                aBlob = b64toBlob(fileContent.substring(22,fileContent.length),'image/png');
                console.log {txt:'b64toBlob result:',result:aBlob}
                entityType = 'images'
                fd = new FormData
                fd.append('image[name]', fileName);
                fd.append('image[description]', 'Design made with the UltiShaper.');
                fd.append('image[file]', aBlob,fileName);

              url = "http://api.youmagine.com/designs/60/" + entityType + ".json?auth_token=#{window.auth_token}"
              console.log "Posting to ",url
              $.ajax url,
                type: 'POST'
                data: fd
                processData: false
                contentType: false
                cache: false
                done: ->
                  console.log 'FormData post: ',data
                error:(a,b,c) ->
                  console.log 'failed: ',a,b,c,a.responseText
        
    loadProject:(projectName, silent=false)=>
      d = $.Deferred()
      project =  new Project
        name : projectName #@lib.get(projectName)
      project.collection = @lib
      projectURI = "#{@storeURI}-#{projectName}"
      rootStoreURI = "#{projectURI}-files"
      project.rootFolder.sync = project.sync
      project.rootFolder.changeStorage("localStorage",new Backbone.LocalStorage(rootStoreURI))
      
      onProjectLoaded=()=>
        #remove old thumbnail
        thumbNailFile = project.rootFolder.get(".thumbnail.png")
        if thumbNailFile?
          project.rootFolder.remove(thumbNailFile)
        project._clearFlags()
        project.trigger("loaded")
        #project.rootFolder.trigger("reset")
        if not silent
          @vent.trigger("project:loaded",project)
        
        d.resolve(project)
      
      project.dataStore = @
      
      fileNames = @_getProjectFiles(projectName)
      for fileName in fileNames
        console.log fileName,' is being filtered ==++++++++++=='
        content = @_readFile(projectName,fileName)
        if fileName.substr(0,7) is 'http://' || fileName.substr(0,8) is 'https://'
          console.log fileName,'before'
          fileName = fileName.split('/')[fileName.split('/').length-1]
          console.log fileName,'after'
        project.addFile
          content : content
          name : fileName
      onProjectLoaded()
      #project.rootFolder.fetch().done(onProjectLoaded)
      return d
   
    deleteProject:(projectName)=>
      d = $.Deferred()
      console.log "browser storage deletion of #{projectName}"
      project = @lib.get(projectName)
      
      projectURI = "#{@storeURI}-#{projectName}"
      rootStoreURI = "#{projectURI}-files"
      
      file = null
      filesURI = "#{projectURI}-files"
      console.log "filesURI #{filesURI}"
      fileNames = localStorage.getItem(filesURI)
      console.log "fileNames #{fileNames}"
      if fileNames
        fileNames = fileNames.split(',')
        for fileName in fileNames 
          fileUri = "#{rootStoreURI}-#{fileName}"
          console.log "deleting #{fileUri}"
          localStorage.removeItem(fileUri)
      
      @_removeFromProjectsList(projectName)
      @lib.remove(project)
      
      return d.resolve()
      
    _getProjectFiles:(projectName)=>
      projectURI = "#{@storeURI}-#{projectName}"
      filesURI = "#{projectURI}-files"
      fileNames = localStorage.getItem(filesURI)
      if fileNames is null
        console.log "need to fetch the file info from YM."
        # $.when ????
        return @_fetchFileListForDesign(projectName)

      else
        fileNames = fileNames.split(',')
      return fileNames

    _fetchFileListForDesign:(designSlug)=>
      console.log "fetching file list for #{designSlug} synchronously..."
      jQuery.ajaxSetup({async:false});
      url = "#{@apiURL}/designs/#{designSlug}/documents.json"
      console.log "url = #{url}"
      req = $.getJSON url, {auth_token:@token}, (data, resp) =>
        window.myData = []
        for num,design of data
          console.log 'design',design
          window.myData.push design.file.url

      console.log("fetched list: ",window.myData)
      jQuery.ajaxSetup({async:true});
      return window.myData
    
module.exports = NodeJsStore
