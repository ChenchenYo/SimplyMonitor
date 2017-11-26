var Configuration = artifacts.require("./Configuration.sol");
var SingleHouse = artifacts.require("./SingleHouse.sol");
var SinglePV = artifacts.require("./SinglePV.sol");
var SingleBattery = artifacts.require("./SingleBattery.sol");
var Grid = artifacts.require("./Grid.sol");

contract('Configuration', function(accounts) {
  var address_admin = accounts [0];
  var address_PV0 = accounts[1];
  var address_PV1 = accounts[2];
  var address_PV2 = accounts[3];
  var address_H0= accounts[4];
  var address_H1= accounts[5];
  var address_H2= accounts[6];
  var address_B0= accounts[7];
  var address_G = accounts[8];

  var configuration;
  var singleHouse0;
  var singleHouse1;
  var singleHouse2;
  var singlePV0;
  var singlePV1;
  var singlePV2;
  var singleBattery0;
  var grid_c;
  var singlePV0_adr;
  var singlePV1_adr;
  var singlePV2_adr;
  var singleHouse0_adr;
  var singleHouse1_adr;
  var singleBattery0_adr;
  var grid_adr;

  it("Create 3 SingleHouse contracts and link to 3 SinglePVs", function() {
    // Here to allocate account information + display them on the screen 
    return Configuration.deployed().then(function(instance){
      configuration = instance;
      configuration.addGrid(address_G);
      configuration.addHouse(address_H0, true);
      configuration.addHouse(address_H1, true);
      configuration.addHouse(address_H2, true);
      configuration.addPV(address_PV0, true);
      configuration.addPV(address_PV1, true);
      configuration.addPV(address_PV2, true);
      configuration.addBattery(address_B0,20, false);
      return configuration.getAdmin.call();
    }).then(function(result){
      console.log("Contract Creator=", result);
      configuration.linkHousePV(address_H0,address_PV0);
      configuration.linkHousePV(address_H1,address_PV1);
      configuration.linkHousePV(address_H2,address_PV1);
      configuration.linkHousePV(address_H1,address_PV2);
      configuration.linkHousePV(address_H2,address_PV2);
      configuration.linkPVBattery(address_PV0,address_B0);
      configuration.linkHouseBattery(address_H0,address_B0);
      configuration.linkHouseBattery(address_H2,address_B0);
      return configuration.getGridAdr.call();
    }).then(function(result){
      console.log("The address (method contractList) of Grid is ",result);
      grid_adr = result;
      grid_c = Grid.at(result);
      return configuration.getContractAddress.call(address_H0);
    }).then(function(result){
      console.log("The address (method contractList) of House0 is ",result);
      singleHouse0_adr = result;
      singleHouse0 = SingleHouse.at(result);
      return configuration.getContractAddress.call(address_H1);
    }).then(function(result){
      console.log("The address (method contractList) of House1 is ",result);
      singleHouse1_adr = result;
      singleHouse1 = SingleHouse.at(result);
      return configuration.getContractAddress.call(address_H2);
    }).then(function(result){
      console.log("The address (method contractList) of House2 is ",result);
      singleHouse2_adr = result;
      singleHouse2 = SingleHouse.at(result);
      return configuration.getContractAddress.call(address_PV0);
    }).then(function(result){
      console.log("The address (method contractList) of PV0 is ",result);
      singlePV0_adr = result;
      singlePV0 = SinglePV.at(result);
      return configuration.getContractAddress.call(address_PV1);
    }).then(function(result){
      console.log("The address (method contractList) of PV1 is ",result);
      singlePV1_adr = result;
      singlePV1 = SinglePV.at(result);
      return configuration.getContractAddress.call(address_PV2);
    }).then(function(result){
      console.log("The address (method contractList) of PV2 is ",result);
      singlePV2_adr = result;
      singlePV2 = SinglePV.at(result);
      return configuration.getContractAddress.call(address_B0);
    }).then(function(result){
      console.log("The address (method contractList) of Battery0 is ",result);
      singleBattery0_adr = result;
      singleBattery0 = SingleBattery.at(result);
    });    
  });

  it("Set Production and price", function() {

    // Basic input. Now we are simulating inputs at one moment in the system
    singleHouse0.setConsumption(3, {from: address_H0});
    singleHouse1.setConsumption(3, {from: address_H1});
    singleHouse2.setConsumption(8, {from: address_H2});
    singlePV0.setProduction(5, {from: address_PV0});
    singlePV1.setProduction(10, {from: address_PV1});
    singlePV2.setProduction(10, {from: address_PV2});
    singleBattery0.setVolume(5, {from: address_B0});
    singleBattery0.setBuyVolume(3,{from: address_B0});
    singlePV0.setPrice(20, {from: address_PV0});
    singlePV1.setPrice(15, {from: address_PV1});
    singlePV2.setPrice(30, {from: address_PV2});
    singleBattery0.setPrice(20, 3, {from: address_B0});
    grid_c.setPrice(10, 1, {from: address_G});
      return singleHouse0.getConsumption.call().then(function(result){
      console.log("The consumption of House0 is ",result[0].toNumber(),result[1].toNumber());
      return singleHouse1.getConsumption.call();
    }).then(function(result){
      console.log("The consumption of House1 is ",result[0].toNumber(),result[1].toNumber());
      return singleHouse2.getConsumption.call();
    }).then(function(result){
      console.log("The consumption of House2 is ",result[0].toNumber(),result[1].toNumber());
    });
  });

  it("Price communication House<->PV (1. House ask for price info)", function() {
    // Key device collect information and start sorting
    singleHouse2.askForPrice();
      singleHouse2.sortPriceList().then(function(result){
    }).then(function(result){
      console.log("House 2 asked and sorted");
      singleHouse0.askForPrice();
      singleHouse0.sortPriceList();
    }).then(function(){
      console.log("House 0 asked and sorted");
      singleHouse1.askForPrice();
      singleHouse1.sortPriceList();
    }).then(function(){
      console.log("House 1 asked and sorted");
      singleBattery0.askForPrice();
      singleBattery0.sort();
    }).then(function(){
      console.log("Battery 0 asked and sorted");
    });
  });

  it("Price communication House<->PV (2. House send out info)", function() {
    /*return singleHouse2.getSortedHInfo.call(singlePV1_adr)
      console.log("returned sorted information from sH2 is (from singlePV1_adr)",result[0].toNumber(),result[1].toNumber(),result[2].toNumber(),result[3]);*/
      console.log("Test starts");
      return singleHouse2.getSortedInfo.call({from: singlePV1_adr}).then(function(result){
      console.log("returned sorted information from sH2 is (from singlePV1_adr)",result[0].toNumber(),result[1].toNumber(),result[2].toNumber(),result[3]);
      /*return singleHouse2.getSortedInfo.call({from: singlePV0_adr});
    }).then(function(result){
      console.log("returned sorted information from sH2 is (from singlePV0_adr)",result[0].toNumber(),result[1].toNumber(),result[2].toNumber(),result[3]);*/
      return singleHouse2.getSortedInfo.call({from: singlePV2_adr});
    }).then(function(result){
      console.log("returned sorted information from sH2 is (from singlePV2_adr)",result[0].toNumber(),result[1].toNumber(),result[2].toNumber(),result[3]);
      return singleHouse2.getSortedInfo.call({from: singleBattery0_adr});
    }).then(function(result){
      console.log("returned sorted information from sH2 is (from singleBattery0_adr)",result[0].toNumber(),result[1].toNumber(),result[2].toNumber(),result[3]);
      return singleHouse2.getSortedInfo.call({from: grid_adr});
    }).then(function(result){
      console.log("returned sorted information from sH2 is (from grid_adr)",result[0].toNumber(),result[1].toNumber(),result[2].toNumber(),result[3]);
    });
  });

  it("Price communication House<->PV (3. PV collect Info)", function() {
    // Let the rest of the houses calculate their preference list (given the price of PV/Battery/Grid)
    return singleHouse1.getSortedInfo.call({from: singlePV1_adr}).then(function(result){
      console.log("returned sorted information from sH1 is (from singlePV1_adr)",result[0].toNumber(),result[1].toNumber(),result[2].toNumber(),result[3]);
      singlePV1.askForRank();
    }).then(function(result){
      console.log("PV collected the information");
      return singlePV1.getSortedInfo.call(0);
    }).then(function(result){
      console.log("PV collected the information. num is", result[0],result[1].toNumber(),result[2].toNumber(),result[3].toNumber());
      return singlePV1.getSortedInfo.call(1);
    }).then(function(result){
      console.log("PV collected the information. num is", result[0],result[1].toNumber(),result[2].toNumber(),result[3].toNumber());
      singlePV1.sortRankList();  
    }).then(function(result){
      console.log("PV sorted the information");
      return singlePV1.getSortedInfo.call(0);
    }).then(function(result){
      console.log("The sorted result at 0 is", result[0],result[1].toNumber(),result[2].toNumber(),result[3].toNumber());
      return singlePV1.getSortedInfo.call(1);
    }).then(function(result){
      console.log("The sorted result at 1 is", result[0],result[1].toNumber(),result[2].toNumber(),result[3].toNumber());
      return singlePV1.getSortedInfo.call(2);
    }).then(function(result){
      console.log("The sorted result at 2 is", result[0],result[1].toNumber(),result[2].toNumber(),result[3].toNumber());
      singlePV0.askForRank();
      singlePV0.sortRankList();
      singlePV2.askForRank();
      singlePV2.sortRankList();
      singleBattery0.askForRank();
      singleBattery0.sortRankList();
    });
  });

  it("Price communication House<->PV (4. Grid check battery)", function() {
    grid_c.needTBCharged().then(function(result){
      console.log("Grid has asked Battery and supply the necessary amount of energy it required");
    });
  });

  it("Price communication House<->PV (5. PV intiate Transaction)", function() {
    // Let the rest of the houses calculate their preference list (given the price of PV/Battery/Grid)
    return singleBattery0.getBuyVol.call().then(function(result){
      console.log("Now B0 wants to buy",result.toNumber());
      return singleBattery0.getVolumeCapacity.call();
    }).then(function(result){
      console.log("Its volume and capacity are",result[0].toNumber(),result[1].toNumber(),result[2].toNumber());
      grid_c.needTBCharged();
      return singleBattery0.getBuyVol.call();
    }).then(function(result){
      console.log("Now B0 wants to buy",result.toNumber());
      return singleBattery0.getVolumeCapacity.call();
    }).then(function(result){
      console.log("Its volume and capacity are",result[0].toNumber(),result[1].toNumber(),result[2].toNumber());
    });
  });

  it("Price communication House<->PV (5. PV and Battery intiate Transaction)", function() {
    // Let the rest of the houses calculate their preference list (given the price of PV/Battery/Grid)
    return singleHouse0.getConsumption.call().then(function(result){
    console.log("Now SH0 consumes",result[0].toNumber(),result[1].toNumber());
    return singleHouse1.getConsumption.call();
  }).then(function(result){
    console.log("Now SH1 consumes",result[0].toNumber(),result[1].toNumber());
    return singleHouse2.getConsumption.call();
  }).then(function(result){
    console.log("Now SH2 consumes",result[0].toNumber(),result[1].toNumber());
    singlePV1.initiateTransaction(0);
    singlePV1.initiateTransaction(1);
    singlePV0.initiateTransaction(0);
    singlePV0.initiateTransaction(1);
    singleBattery0.initiateTransaction(0);
    singleBattery0.initiateTransaction(1);
    singlePV2.initiateTransaction(0);
    singlePV2.initiateTransaction(1);
    return singleHouse0.getConsumption.call();
  }).then(function(result){
    console.log("Now SH0 consumes",result[0].toNumber(),result[1].toNumber());
    return singleHouse1.getConsumption.call();
  }).then(function(result){
    console.log("Now SH1 consumes",result[0].toNumber(),result[1].toNumber());
    return singleHouse2.getConsumption.call();
  }).then(function(result){
    console.log("Now SH2 consumes",result[0].toNumber(),result[1].toNumber());
    return singleBattery0.getVolumeCapacity.call();
  }).then(function(result){
    console.log("Its volume and capacity are",result[0].toNumber(),result[1].toNumber(),result[2].toNumber());
    });
  });

  it("Price communication House<->PV (5. PV and Battery intiate Transaction)", function() {
    return singlePV0.getProduction.call().then(function(result){
      console.log("PV0 still has",result[0].toNumber(),result[1].toNumber());
      return singlePV1.getProduction.call();
    }).then(function(result){
      console.log("PV1 still has",result[0].toNumber(),result[1].toNumber());
      return singlePV2.getProduction.call();
    }).then(function(result){
      console.log("PV2 still has",result[0].toNumber(),result[1].toNumber());
    });
  });

  it("Price communication House<->PV (6. PV sell excess energy)", function() {
    return singlePV0.getWallet.call().then(function(result){
      console.log("PV0's wallet",result.toNumber());
      return singlePV1.getWallet.call();
    }).then(function(result){
      console.log("PV1's wallet",result.toNumber());
      return singlePV2.getWallet.call();
    }).then(function(result){
      console.log("PV2's wallet",result.toNumber());
      singlePV0.sellExcess();
      singlePV1.sellExcess();
      singlePV2.sellExcess();
      return singlePV0.getProduction.call();
    }).then(function(result){
      console.log("After selling excess energy...");
      console.log("PV0 still has",result[0].toNumber(),result[1].toNumber());
        return singlePV1.getProduction.call();
      }).then(function(result){
        console.log("PV1 still has",result[0].toNumber(),result[1].toNumber());
        return singlePV2.getProduction.call();
      }).then(function(result){
        console.log("PV2 still has",result[0].toNumber(),result[1].toNumber());
      return singlePV0.getWallet.call();
    }).then(function(result){
      console.log("PV0's wallet",result.toNumber());
      return singlePV1.getWallet.call();
    }).then(function(result){
      console.log("PV1's wallet",result.toNumber());
      return singlePV2.getWallet.call();
    }).then(function(result){
      console.log("PV2's wallet",result.toNumber());
    });
  });

  it("Price communication House<->PV (7. House buy energy from Grid)", function() {
    
  });

});