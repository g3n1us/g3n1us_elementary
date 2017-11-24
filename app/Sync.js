function Sync(initialconfig){

	var _this = this;

	_this.syncClient = 	new AWS.CognitoSyncManager();
	_this.put = function(dataset, key, value, callback){
		
			if(typeof value !== "string") value = JSON.stringify(value);	
		
		   _this.syncClient.openOrCreateDataset(dataset, function(err, dataset) {
				if(err){					
					console.log(err);
					return;
				}
		      dataset.put(key, value, function(err, record){
				if(err){
					console.log(err);
					callback('error', null, null);
					return;
				}			      
		        dataset.synchronize({
		
		            onSuccess: function(data, newRecords) {
			            if(callback)
			                callback(null, data, newRecords);
		            },
		
		            onFailure: function(err) {
			            if(callback)
			                callback(err, null, null);
		            }
		
		        });
		
		      });
		
		   });
	   
	}
	
	_this.get = function(dataset, key){
		_this.syncClient.openOrCreateDataset(dataset, function(err, dataset) {
			if(err){
				console.log(err);
				return;
			}
			
			dataset.get(key, function(err, value) {
				if(err){
					console.log(err);
					return;
				}
				return value;
				
			});
		});
	}
}
if(typeof module !== "undefined")
	module.exports = Sync;
