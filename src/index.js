//import data from "./legislator";

let extraData = "None";

window.loadData = (json, officeFilter, platform) => {
  const data = JSON.parse(json);

  //add index element
  const formattedData = data.data.map((e) => Object(e.fieldData));
  formattedData.forEach(function (row, index) {
    row.index = index;
  });

  //add an element for district that are only numbers for sorting
  formattedData.forEach(function (row) {
    row.DistrictNum = Number(row.District.replace(/\D/g, ""));
  });

   //add an element for district that are only letters for sorting
   formattedData.forEach(function (row) {
    row.DistrictLet = row.District.split('').filter(char => /[a-zA-Z]/.test(char));
  });

  let filteredData = [];

  //filter by office for desktop and ipad
  if (platform !== "iPhone") {
    for (let i = 0; i < formattedData.length; i++) {
      if (formattedData[i].Office === officeFilter) {
        filteredData = [...filteredData, formattedData[i]];
      }
    }
  } else {
    for (let i = 0; i < formattedData.length; i++) {
      if (formattedData[i].Office.length > 0) {
        filteredData = [...filteredData, formattedData[i]];
      }
    }
  }

  const finalData = filteredData;


  let committeeName = 'Legislators';
  //console.log(finalData);


  //get rid of the fieldData level
  const formatData = data.data.map((e) =>
    Object.keys(e.fieldData).map((key) => e.fieldData[key])
  );

  //break out the list of marked data
  let markArray = data.markArray;

  $.extend(true, $.fn.dataTable.defaults, {
    language: {
      search: "",
    },
  });




  const table = $("#table").DataTable({
    data: finalData,
    dom: 'lrt',
    paging: false,
    scrollResize: true,
    scrollCollapse: true,
    scrollY: "30000px",
    fixedHeader: false,
    ordering: true,
    info: false,
    headerCallback: function (thead, data, start, end, display) {
      const headerDiv = document.getElementById("headerDiv")
      const officeTitle = officeFilter === 'Representative' ? 'House' :
      officeFilter === 'Senator' ? 'Senate' :
      committeeName 
      ;
      headerDiv.textContent = officeTitle + ' ('+(end - start)+')';

    },
    columns: [
      {
        data: "LastName",
        name: "lastName",
        visible: false,
      },
      {
        data: "FirstName",
        name: "firstName",
        visible: false,
      },
      {
        data: "DistrictNum",
        name: "district",
        visible: false,
      },
      {
        data: "Value",
        name: "value",
        visible: false,
      },
      {
        data: "OfficeAddress",
        name: "officeAddress",
        visible: false,
      },
      {
        data: "Party",
        name: "party",
        visible: false,
      },
      {
        data: "NewlyElected",
        name: "newlyElected",
        visible: false,
      },
      {
        data: "_ID",
        render: function (data, type) {
          return markArray.includes(data) ? true : false;
        },
        visible: false,
      },
      {
        data: "Office",
        name: "office",
        visible: false,
      },
      {
        data: "CommitteeList",
        name: "committeeList",
        visible: false,
      },{
        data: "DistrictLet",
        name: "districtLet",
        visible: false,
      },{
        data: "Email",
        name: "email",
        visible: false,
      },
      {
        //Mark Icon
        render: function (data, type, row) {
          const $vertL = document.createElement("div");
          if (row.LeadershipPosition === "Conservative Caucus") {
            var vertClass = "vlRed";
          } else if (
            row.LeadershipPosition !== "LAMEDUCK" &&
            row.LeadershipPosition.length > 0
          ) {
            var vertClass = "vlGreen";
          } else {
            var vertClass = "vlClear";
          }
          $vertL.classList.add(vertClass);

          const mark = document.createElement("button");
          if (markArray.includes(row._ID)) {
            var markClass = "fa-check-square-o";
          } else {
            var markClass = "fa-square-o";
          }
          mark.innerHTML = '<i class="fa ' + markClass + '"></i>';
          mark.classList.add("buttonMark");
          mark.onclick = function () {
            let result = (({ _ID }) => ({ _ID }))(row);
            result.marked = markArray.includes(row._ID) ? true : false;

            if (markArray.includes(row._ID)) {
              markArray = markArray.filter(function (id) {
                return id !== row._ID;
              });
            } else {
              markArray.push(row._ID);
            }
            result.action = "mark";
            result.index = $(this).closest("tr").index();
            callFM(result);
            stopPropagation();
          };
          //Email Button
          const buttonMail = document.createElement("button");
          buttonMail.innerHTML = '<i class = "fa fa-envelope"></i>';
          buttonMail.classList.add("buttonMail");
          buttonMail.onclick = function () {
            let result = (({ _ID, Email }) => ({ _ID, Email }))(row);
            result.action = "email";
            callFM(result);
            event.stopPropagation();
          };
          const buttonDiv = document.createElement("div");
          buttonDiv.classList.add("container");

          const leftDiv = document.createElement("div");
          leftDiv.classList.add("leftDiv");

          buttonDiv.appendChild(mark);
          buttonDiv.appendChild(buttonMail);
          $vertL.appendChild(buttonDiv);
          return $vertL;
        },
        orderable: false,
      },
      {
        //Party Icon
        render: function (data, type, row) {
          if (row.Party === "R") {
            var partyClass = "i-circle-red";
          } else {
            var partyClass = "i-circle-blue";
          }
          const $party = document.createElement("div");
          $party.classList.add(partyClass);
          $party.textContent = row.Party;
          return $party;
        },
        orderable: false,
      },
      {
        //Info
        render: function (data, type, row) {
          const infoDiv = document.createElement("div");
          const name = document.createElement("div");
          name.onclick = function () {
            let result = (({ _ID }) => ({ _ID }))(row);
            result.action = "navigate";
            callFM(result);
            event.stopPropagation();
          };
          name.classList.add("bold");
          name.textContent = row.FirstName + " " + row.LastName;
          const infoOffice = document.createElement("div");
          infoOffice.textContent = row.Office;
          infoOffice.classList.add("infoOffice");
          if (platform === "iPhone") {
            infoDiv.appendChild(infoOffice);
            infoDiv.appendChild(name);
          } else {
            infoDiv.appendChild(name);
          }
          return infoDiv;
        },
        orderable: false,
      },
      {
        //District
        render: function (data, type, row) {
          const $district = document.createElement("div");
          $district.classList.add("district");
          if (extraData === "None") {
            $district.textContent = "";
          } else if (extraData === "Office") {
            $district.textContent = row.OfficeAddress;
          } else if (extraData === "District") {
            $district.textContent = row.District;
          } else if (extraData === "Value") {
            $district.textContent = row.Value;
          }
          return $district;
        },
        visible: true,
        orderable: false,
      },
      {
        //Value
        render: function (data, type, row) {
          const $value = document.createElement("div");
          $value.classList.add("district");
          $value.textContent = row.Value;
          return $value;
        },
        visible: false,
        orderable: false,
      },
      {
        //OfficeAdd
        render: function (data, type, row) {
          const $OfficeAdd = document.createElement("div");
          $OfficeAdd.classList.add("district");
          $OfficeAdd.textContent = row.OfficeAddress;
          return $OfficeAdd;
        },
        visible: false,
        orderable: false,
      },
      {
        //Const Button
        render: function (data, type, row) {
          const $constButton = document.createElement("button");
          $constButton.onclick = function () {
            let result = (({ _ID }) => ({ _ID }))(row);
            result.action = "constCard";
            callFM(result);
            event.stopPropagation();
          };
          $constButton.classList.add("constBtnClass");
          const mems = document.createElement("div");
          mems.textContent = row.CountMembers + " M";
          const chu = document.createElement("div");
          chu.textContent = row.CountChurches + " C";
          $constButton.appendChild(mems);
          $constButton.appendChild(chu);
          return $constButton;
        },
        orderable: false,
      },
      {
        //Profile Button
        render: function (data, type, row) {
          const $profileButton = document.createElement("button");
          $profileButton.onclick = function () {
            let result = (({ _ID }) => ({ _ID }))(row);
            result.action = "profileCard";
            callFM(result);
            event.stopPropagation();
          };
          $profileButton.classList.add("profileBtnClass");
          $profileButton.innerHTML = '<i class = "fa fa-user"></i>';
          return $profileButton;
        },
        orderable: false,
      },
      {
        //Note Button
        render: function (data, type, row) {
          const $noteButton = document.createElement("button");
          $noteButton.onclick = function () {
            let result = (({ _ID }) => ({ _ID }))(row);
            result.action = "noteCard";
            callFM(result);
            event.stopPropagation();
          };
          $noteButton.classList.add("profileBtnClass");
          $noteButton.innerHTML = '<i class = "fa fa-sticky-note"></i>';
          return $noteButton;
        },
        orderable: false,
      },
    ],
  });

  window.sortNames = function () {
    //   table.columns([11,12,13]).visible(false);
    extraData = null;
    table.column(3).cells().invalidate();
    table.column(3).render();
    table
      .order([
        { name: "lastName", dir: "asc" },
        { name: "firstName", dir: "asc" },
      ])
      .draw();
  };

  window.sortDistrict = function () {
    extraData = "District";
    table.column(3).cells().invalidate();
    table.column(3).render();
    table
      .order([
        { name: "districtLet", dir: "asc" },
        { name: "district", dir: "asc" },
        { name: "lastName", dir: "asc" },
        { name: "firstName", dir: "asc" },
      ])
      .draw();
  };

  window.sortValue = function () {
    extraData = "Value";
    table.column(3).cells().invalidate();
    table.column(3).render();
    table
      .order([
        { name: "value", dir: "desc" },
        { name: "lastName", dir: "asc" },
        { name: "firstName", dir: "asc" },
      ])
      .draw();
  };

  window.sortOffice = function () {
    extraData = "Office";
    table.column(3).cells().invalidate();
    table.column(3).render();
    table
      .order([
        { name: "officeAddress", dir: "asc" },
        { name: "lastName", dir: "asc" },
        { name: "firstName", dir: "asc" },
      ])
      .draw();
  };

  window.filterOffice = function (value) {
    table.columns([8]).search(value).draw();
  };

  window.filterOfficeClear = function (value) {
    table.columns([8]).search("").draw();
  };

  window.filterDem = function () {
    table.columns([5]).search("D").draw();
  };

  window.filterDemClear = function () {
    table.columns([5]).search("").draw();
  };

  window.filterRep = function () {
    table.columns([5]).search("R").draw();
  };

  window.filterRepClear = function () {
    table.columns([5]).search("").draw();
  };

  window.filterCom = function (index) {
    committeeName = index;
    table.columns([9]).search(index).draw();
  };

  
  window.filterNew = function () {
    table.columns([6]).search("Newly Elected").draw();
  };

  window.filterNewClear = function () {
    table.columns([6]).search("").draw();
  };

  window.filterMark = function () {
    table.columns([7]).search(true).draw();
  };

  window.filterMarkClear = function () {
    table.columns([7]).search("").draw();
  };

  window.filterAll = function () {
    committeeName = 'Legislators';
    table.search("").columns().search("").draw();
  };

  window.callFM = function (result) {
    FileMaker.PerformScript("wv_runScript", JSON.stringify(result));
  };

  window.refreshRow = function (row) {
    table.column(row).cells().invalidate();
    table.column(row).render();
  };

  //custom format of Search boxes
  $("[type=search]").each(function () {
    $(this).attr("placeholder", "Search...");
    //  $(this).before('<span class="fa fa-search"></span>');
  });

  window.exportFM = function () {
    let dataExport = table.buttons.exportData();
    dataExport = dataExport.body;
    let data = dataExport.map(subArr => subArr[11]);
    data = JSON.stringify(data);
    console.log(data);
    FileMaker.PerformScriptWithOption("wv_Export", data, "0")
    };

};




