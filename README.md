### Database Structure

    "users"/uid:{
        "email":string,
        "name":string,
        "role":string, #("admin"/"owner"/"employee")
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

### firebase database

#### load existed data

    var someRef = firebase.database().ref(PATH);
    someRef.on("value").then( (snapshot)=>{
        snapshot.key;
        snapshot.val();
        snapshot.children("someKey").val();
    });
    
#### set data

    var someRef = firebase.database().ref(PATH);
    someRef.set(OBJ).then();
    
#### push data

    var someRef = firebase.database().ref(PATH).push();
    someRef.set(OBJ).then();
    
#### push data

    var someRef = firebase.database().ref(PATH);
    someRef.update(OBJ).then();
