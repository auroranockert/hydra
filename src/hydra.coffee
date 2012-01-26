Nokia = 'Nokia'
Samsung = 'Samsung'

if window.WebCL
	Context = window.WebCL
	
	WebCL = Nokia
else if window.WebCLComputeContext
	Context = new window.WebCLComputeContext()
	
	WebCL = Samsung
else
	WebCL = null

class Hydra
	@provider = WebCL
	@supported = (WebCL != null)
	
	if @provider == Samsung
		for constant of window.WebCLComputeContext
			if constant != 'property'
				Hydra[constant] = window.WebCLComputeContext[constant]
			
		
	else if @provider == Nokia
		for constant of window.WebCL
			if constant.substring(0, 3) == "CL_"
				Hydra[constant.substring(3)] = window.WebCL[constant]
			
		
	
	if Context != null 
		@getPlatformIDs = () ->
			result = []; platforms = Context.getPlatformIDs()
			
			for i in [0 ... platforms.length]
				result[i] = new Platform(platforms[i])
			
			return result
		
	else
		@getPlatformIDs = () -> return []
	

class Platform
	constructor: (platform) ->
		@id = platform
	
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
			result[i] = new Device(devices[i])
		
		return result
	

class Device
	constructor: (device) ->
		@id = device
	
	getDeviceInfo: (info) ->
		@id.getDeviceInfo(info)
	

this.Hydra = Hydra