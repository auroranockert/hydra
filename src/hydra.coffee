nokia = 'Nokia'
samsung = 'Samsung'

if window.WebCL
	context = window.WebCL
	
	webcl = nokia
else if window.WebCLComputeContext
	context = new window.WebCLComputeContext()
	
	webcl = samsung
else
	webcl = null

class Hydra
	@provider = webcl
	@supported = (webcl != null)
	
	if @provider == samsung
		for constant in window.WebCLComputeContext
			# TODO: Proper blacklist / whitelist
			this[constant] = window.WebCLComputeContext[constant] if constant != 'property'
		
	else if @provider == nokia
		for constant in window.WebCL
			# TODO: Proper blacklist / whitelist
			this[constant[3 .. -1]] = window.WebCL[constant] if constant[0 .. 2] == 'CL_'
		
	

this.Hydra = Hydra