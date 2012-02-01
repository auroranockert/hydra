Nokia = 'Nokia'
Samsung = 'Samsung'
Mozilla = 'Mozilla'

if window.WebCL
	if window.WebCL.getPlatformIDs
		Provider = Nokia
		
		CL = window.WebCL
	else
		Provider = Mozilla
		
		CL = null
	
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
			
		
	
	@getPlatformIDs = () ->
		result = []
			
		switch @provider
			when Nokia, Samsung
				platforms = CL.getPlatformIDs()
			else
				platforms = []
			
		
		for i in [0 ... platforms.length]
			result[i] = new Platform(platforms, i)
			
		return result
	
	@createContext = (platform, devices) ->
		switch Hydra.provider
			when Samsung
				if devices.length == 1 && devices[0].index == 0
					return new Context(CL.createContext(null, devices[0].devices, null, null))
				else
					throw "Not implemented yet"
			when Nokia
				return new Context(CL.createContext([WebCL.CL_CONTEXT_PLATFORM, platform.id], device.id for device in devices))
			
		
	

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
		
	
	createCommandQueue: (device, properties) ->
		return new CommandQueue(@id.createCommandQueue(device.id, properties), this)
	
	createBuffer: (flags, size) ->
		return new Buffer(@id.createBuffer(flags, size, null))
	
	createProgramWithSource: (source) ->
		return new Program(@id.createProgramWithSource(source))
	

class CommandQueue
	constructor: (queue, @context) ->
		@id = queue
	
	enqueueWriteBuffer: (buffer, blocking, offset, size, hostPtr) ->
		switch Hydra.provider
			when Samsung
				@id.enqueueWriteBuffer(buffer.id, blocking, offset, size, hostPtr, 0)
			when Nokia
				@id.enqueueWriteBuffer(buffer.id, blocking, offset, size, hostPtr, [])
			
		
	
	enqueueReadBuffer: (buffer, blocking, offset, size, hostPtr) ->
		switch Hydra.provider
			when Samsung
				@id.enqueueReadBuffer(buffer.id, blocking, offset, size, hostPtr, 0)
			when Nokia
				@id.enqueueReadBuffer(buffer.id, blocking, offset, size, hostPtr, [])
			
		
	
	enqueueNDRangeKernel: (kernel, globalWorkSize, localWorkSize) ->
		switch Hydra.provider
			when Samsung
				@id.enqueueNDRangeKernel(kernel.id, globalWorkSize.length, null, new Int32Array(globalWorkSize), new Int32Array(localWorkSize), 0)
			when Nokia
				@id.enqueueNDRangeKernel(kernel.id, globalWorkSize.length, [], globalWorkSize, localWorkSize, [])
			
		
	
	finish: () ->
		switch Hydra.provider
			when Samsung
				@synchronizeBuffer ?= @context.createBuffer(Hydra.MEM_READ_WRITE, 4).id
				@synchronizeTarget ?= new Float32Array(1)
				
				@id.enqueueReadBuffer(@synchronizeBuffer, true, 0, 4, @synchronizeTarget, 0)
			else
				@id.finish()
			
		
	

class Buffer
	constructor: (buffer) ->
		@id = buffer
	

class Program
	constructor: (program) ->
		@id = program
	
	buildProgram: (devices) ->
		switch Hydra.provider
			when Samsung
				@id.buildProgram(null, null, null)
			when Nokia
				@id.buildProgram(device.id for device in devices, "")
			
		
	
	createKernel: (name) ->
		return new Kernel(@id.createKernel(name))
	

class Kernel
	constructor: (kernel) ->
		@id = kernel
	
	setKernelArg: (i, value, type) ->
		@id.setKernelArg(i, value, type)
	
	setKernelArgGlobal: (i, value) ->
		switch Hydra.provider
			when Samsung
				@id.setKernelArgGlobal(i, value.id)
			when Nokia
				@id.setKernelArg(i, value.id)
			
		
	

this.Hydra = Hydra