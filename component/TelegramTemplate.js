var  itemMaster = {
    "itemMaster": [
        {
            "client": "DEFAULT",
            "Description1": "1234",
            "Description2": "5678",
            "ItemNo": "ITEM0002",

        },
        {
            "client": "DEFAULT",
            "Description1": "91011",
            "Description2": "121314",
            "ItemNo": "ITEM0003",
        },
        {
            "client": "DEFAULT",
            "Description1": "91011",
            "Description2": "121314",
            "ItemNo": "ITEM0004",
        }
    ]
};

var pickingOrders = {
    "pickingOrders": [
        {   
            "key" : "xxx", 
            "OrderNo": "",
            "SKUs": [
                { "ItemNo": "ITEM0001", "Qty": "1" , "batchNo" : "A" , "prodDate" : "20210401" },
                { "ItemNo": "ITEM0002", "Qty": "1" , "batchNo" : "A" , "prodDate" : "20210401" },
                { "ItemNo": "ITEM0003", "Qty": "1" , "batchNo" : "A" , "prodDate" : "20210401" }
            ]
        },
        {
            "OrderNo": "",
            "SKUs": [
                { "ItemNo": "ITEM0001", "Qty": "1" , "batchNo" : "A" , "prodDate" : "20210401" },
                { "ItemNo": "ITEM0002", "Qty": "1" , "batchNo" : "A" , "prodDate" : "20210401" },
                { "ItemNo": "ITEM0003", "Qty": "1" , "batchNo" : "A" , "prodDate" : "20210401" }
            ]
        }, {
            "OrderNo": "",
            "SKUs": [
                { "ItemNo": "ITEM0001", "Qty": "1" , "batchNo" : "A" , "prodDate" : "20210401" },
                { "ItemNo": "ITEM0002", "Qty": "1" , "batchNo" : "A" , "prodDate" : "20210401" },
                { "ItemNo": "ITEM0003", "Qty": "1" , "batchNo" : "A" , "prodDate" : "20210401" }
            ]
        }]
};


var storageOrders = {
    "storageOrders": [
        {   
            "ASN" : "ASN1",
            "BOXId": "BOX0001",
            "SKUs": [
                { "ItemNo": "ITEM0001", "Qty": "50" , "batchNo" : "A", "prodDate" : "20210401" , "Description" : "1234" , "Description2" : "5678" },
                { "ItemNo": "ITEM0002", "Qty": "50" , "batchNo" : "A", "prodDate" : "20210401" , "Description" : "1234" , "Description2" : "5678" }
            ]
        },
        {   
            "ASN" : "ASN1",
            "BOXId": "BOX0002",
            "SKUs": [
                { "ItemNo": "ITEM0003", "Qty": "50" , "batchNo" : "A", "prodDate" : "20210401" , "Description" : "901112" , "Description2" : "13141516" }
            ]
        }
    ]};



var storageOrderack = {
    "storageOrderack": [
        {
            "OrderNo": "",
            "mainStage" : "FINISHED",
            "SKUs": [
                { "ItemNo": "", "Qty": "" , "batchNo" : "", "prodDate" : "DD-MM-YY" ,
                 "dif" : "NONE" , "orderedRty" : "10" , "storedQty" : "10"},
                { "ItemNo": "", "Qty": "" , "batchNo" : "", "prodDate" : "DD-MM-YY" ,
                 "dif" : "NONE" , "orderedRty" : "10" , "storedQty" : "10"},
                { "ItemNo": "", "Qty": "" , "batchNo" : "", "prodDate" : "DD-MM-YY" ,
                 "dif" : "NONE" , "orderedRty" : "10" , "storedQty" : "10"}
            ]
        }]
};