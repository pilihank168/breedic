### Database Structure

    "users"/uid:{
        "email":string,
        "name":string,
        "role":string, #("admin"/"owner"/"employee"/"analyst")
        "currentFarm":int,
        "permission":{
            "view":bool,
            "add":bool,
            "edit":bool,
            "review":bool
        },
        "active":bool,
        "farmNo":{
            farmID:farmID
            ...
        }
    }
    
    "owner"/uid:{
        "email":string,
        "name":string,
        "active":bool,
        "note":string,
        "farmNo":{
            farmID:farmID
            ...
        }
    }
        
    "employee"/farmNo/uid:{
        "email":string,
        "name":string,
        "position":string,
        "phone":string,
        "note":string,
        "permission":{
            "view":bool,
            "add":bool,
            "edit":bool,
            "review":bool
        },
        "active":bool
    }
    
    "farms"/farmNo:{
        "name":string,
        "owner":uid,
        "size":string,
        "type":string,
        "address":string,
        "phone":string
    }

    "sows"/farmNo/registerNo:{
        "earmark"
        "strain"
        "birthday"
        "fatherNo"
        "motherNo"
        "fatherEar"
        "motherEar"
        "source"
        "status":s/d/p/w-yyyy-mm-dd
        "score":
    }

### firebase database

#### load existed data

    var someRef = firebase.database().ref(PATH);
    someRef.on("value").then( (snapshot)=>{
        snapshot.key;
        snapshot.val();
        snapshot.children("someKey").val();
    });
    
#### load list of data
    var someRef = firebase.database().ref(PATH);
    someRef.on("value").then( (snapshot)=>{
        snapShot.forEach( (childSnapshot)=>{
            childSnapshot.val()
        });
    });
    
#### set data

    var someRef = firebase.database().ref(PATH);
    someRef.set(OBJ).then();
    
#### push data

    var someRef = firebase.database().ref(PATH).push();
    someRef.set(OBJ).then();
    
#### update data

    var someRef = firebase.database().ref(PATH);
    someRef.update(OBJ).then();

### workflow reminder for production

#### service (server and client)

0. load existed data => local
1. add new entry to service/{farmNo}/{date}/{concat(date, sowId, boarId)} => local
2. get production/{farmNo}/{sowId}/parity, update it (+=1) then set service/{farmNo}/{date}/{productionId}/parity => cloud function
3. duplicate entry to production/{farmNo}/{sowId}/{parity} => cloud function
4. duplicate entry to diagnosis/{farmNo}/{productionId} => cloud function
5. pair with semen data : semen/{farmNo}/ => cloud function
6. add log to log/{farmNo}/{sowId} and log/{farmNo}/{boarId} => local
7. update sows/{farmNo}/{sowId}/(status, lastService) => local

#### diagnosis (only client)

0. load data from diagnosis/{farmNo}/{productionId} by setting threshold date
1. update result to production/{farmNo}/{sowId}/{parity}
2. add result to diagnosisHistory/{farmNo}/{productionId}
3. duplicate entry to parturition/{farmNo}/{productionId}
4. remove diagnosis/{farmNo}/{productionId}
5. add log to log/{farmNo}/{sowId}
6. update sows/{farmNo}/{sowId}/(status, lastDue)

#### parturition (only client)

0. load data from parturition/{farmNo}/{productionId}
1. update result to production/{farmNo}/{productionId}
2. add result to litters/{farmNo}/{productionId} and suckings/{farmNo}/{litterNo}
3. add to parturitionHistory/{farmNo}/{productionId}
4. remove parturition/{farmNo}/{productionId}
5. add log to log/{farmNo}/{sowId}
6. update sows/{farmNo}/{sowId}/(status, lastParturition)

#### wean (only client)

0. load data from litters & suckings
1. update to production/{farmNo}/{productionId}
2. add result to weaners/{farmNo}/{weanerId}
3. duplicate to littersHistory/{farmNo}/{productionId}
4. remove litters/{farmNo}/{productionId}
5. add log to log/{farmNo}/{sowId}
6. update sows/{farmNo}/{sowId}/(status, lastWean)

#### transfer (only client)

0. load data without status
1. add boar/sow 
2. set status 
3. add log (birth and wean and transfer)
4. add physical (birth and wean)

#### semen

0. load data
1. add semen
2. log
3. update boar

#### physical

0. log

#### export

0. log
1. set unavailibility

#### leave

0. log
1. set unavailibility
