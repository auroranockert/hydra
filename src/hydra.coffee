Nokia = 'Nokia'
Samsung = 'Samsung'

if window.WebCL
	CL = window.WebCL
	
	Provider = Nokia
else if window.WebCLComputeContext
	CL = new window.WebCLComputeContext()
	
	Provider = Samsung
else
	Provider = null

class Hydra
	@provider = Provider; @supported = (Provider != null)
	
	if @provider == Samsung
		for constant of window.WebCLComputeContext
			if constant != 'property'
				Hydra[constant] = window.WebCLComputeContext[constant]
			
		
	else if @provider == Nokia
		for constant of window.WebCL
			if constant.substring(0, 3) == "CL_"
				Hydra[constant.substring(3)] = window.WebCL[constant]
			
		
	
	if CL != null 
		@getPlatformIDs = () ->
			result = []; platforms = CL.getPlatformIDs()
			
			for i in [0 ... platforms.length]
				result[i] = new Platform(platforms, i)
			
			return result
		
	else
		@getPlatformIDs = () -> return []
	
	@createContext = (devices) ->
		switch Hydra.provider
			when Samsung
				if devices.length == 1 && devices[0].index == 0
					return new Context(CL.createContext(null, devices[0].devices, null, null))
				else
					throw "Not implemented yet"
			when Nokia
				throw "Not implemented yet"
			
		
	

class Platform
	constructor: (@platforms, @index) ->
		@id = @platforms[@index]
	
	getPlatformInfo: (info) ->
		@id.getPlatformInfo(info)
	
	getDeviceIDs: (type) ->
		if Hydra.provider == Nokia
			if type == Hydra.DEVICE_TYPE_GPU
				result = []; devices = this.getDeviceIDs(Hydra.DEVICE_TYPE_ALL)
				
				for device in devices
					result.push(device) if device.getDeviceInfo(Hydra.DEVICE_TYPE) == Hydra.DEVICE_TYPE_GPU
				
				return result
			
		
		if Hydra.provider == Samsung
			if type == Hydra.DEVICE_TYPE_ALL
				return this.getDeviceIDs(Hydra.DEVICE_TYPE_CPU).concat(this.getDeviceIDs(Hydra.DEVICE_TYPE_GPU))
			
		
		result = [];
		
		devices = @id.getDeviceIDs(type)
			
		for i in [0 ... devices.length]
			result[i] = new Device(devices, i)
		
		return result
	

class Device
	constructor: (@devices, @index) ->
		@id = @devices[@index]
	
	getDeviceInfo: (info) ->
		return @id.getDeviceInfo(info)
	

class Context
	constructor: (context) ->
		@id = context
	
	getContextInfo: (info) ->
		results = @id.getContextInfo(info)
		
		if info == Hydra.CONTEXT_DEVICES
			devices = []
			
			devices[i] = new Device(result) for result, i in results
			
			return devices
		else
			return results
		
	
	createBuffer: (flags, size) ->
		return new Buffer(@id.createBuffer(flags, size, null))
	
	createProgramWithSource: (source) ->
		return new Program(@id.createProgramWithSource(source))
	

class Buffer
	constructor: (buffer) ->
		@id = buffer
	

class Program
	constructor: (program) ->
		@id = program
	
	buildProgram: () ->
		switch Hydra.provider
			when Samsung
				@id.buildProgram(null, null, null)
			when Nokia
				throw "Not implemented yet"
			
		
	

this.Hydra = Hydra