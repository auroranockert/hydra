nokia = 'Nokia'
samsung = 'Samsung'

if window.WebCL
	context = window.WebCL
	
	webcl = nokia
else if window.WebCLComputeContext
	context = window.WebCLComputeContext
	
	webcl = samsung
else
	webcl = null

class Hydra
	@provider = webcl
	@supported = (webcl != null)

this.Hydra = Hydra