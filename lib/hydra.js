(function() {
  var Hydra, context, nokia, samsung, webcl;

  nokia = 'Nokia';

  samsung = 'Samsung';

  if (window.WebCL) {
    context = window.WebCL;
    webcl = nokia;
  } else if (window.WebCLComputeContext) {
    context = window.WebCLComputeContext;
    webcl = samsung;
  } else {
    webcl = null;
  }

  Hydra = (function() {

    function Hydra() {}

    Hydra.provider = webcl;

    Hydra.supported = webcl !== null;

    return Hydra;

  })();

  this.Hydra = Hydra;

}).call(this);
