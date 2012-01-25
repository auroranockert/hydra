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
	
	# WTF Coffee, I just want a simple loop. I know it is not uber-fast.
	if @provider == Samsung
		`for (constant in window.WebCLComputeContext) {
			if (constant != 'property') {
				Hydra[constant] = window.WebCLComputeContext[constant]
			}
		}`
		
		Hydra.DEVICE_TYPE_ALL = 0x0F # TODO: Hack in my version of the prototype
	else if @provider == Nokia
		`for (constant in window.WebCL) {
			if (constant.substring(0, 3) == "CL_") {
				Hydra[constant.substring(3)] = window.WebCLComputeContext[constant]
			}
		}`
	
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
		result = []; devices = @id.getDeviceIDs(type)
			
		for i in [0 ... devices.length]
			result[i] = new Device(devices[i])
			
		return result
	

class Device
	constructor: (device) ->
		@id = device
	
	getDeviceInfo: (info) ->
		@id.getDeviceInfo(info)
	

this.Hydra = Hydra