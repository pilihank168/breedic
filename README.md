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
