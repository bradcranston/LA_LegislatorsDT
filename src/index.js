//import data from "./legislator";

let extraData = "None";
let displayCom = false;

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
    row.DistrictLet = row.District.split("").filter((char) =>
      /[a-zA-Z]/.test(char)
    );
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

  let committeeName = "Legislators";
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
    dom: "lrt",
    paging: false,
    scrollResize: true,
    scrollCollapse: true,
    scrollY: "30000px",
    fixedHeader: false,
    ordering: true,
    info: false,
    headerCallback: function (thead, data, start, end, display) {
      const headerDiv = document.getElementById("headerDiv");
      const officeTitle =
        displayCom === true
          ? committeeName
          : officeFilter === "Representative"
          ? "House"
          : officeFilter === "Senator"
          ? "Senate"
          : committeeName;
      headerDiv.textContent = officeTitle + " (" + (end - start) + ")";
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
        data: "District",
        name: "district",
        visible: false,
        type: "alphanum",
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
      },
      {
        data: "DistrictLet",
        name: "districtLet",
        visible: false,
      },
      {
        data: "Email",
        name: "email",
        visible: false,
      },
      {
        data: "Score",
        name: "score",
        visible: false,
      },
      {
        data: "GroupList",
        name: "GroupList",
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
          if (row.NewlyElected.length > 0) {
            name.classList.add("green");
          }
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
          } else if (extraData === "Score") {
            $district.textContent = row.Score;
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
      },     {
        data: "isChair",
        name: "isChair",
        visible: false,
      },     {
        data: "isViceChair",
        name: "isViceChair",
        visible: false,
      }
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

  jQuery.fn.dataTable.ext.type.order["alphanum-asc"] = function (a, b) {
    const extractChunks = (str) => {
      return str
        .match(/(\d+|\D+)/g)
        .map((chunk) =>
          isNaN(chunk) ? chunk.toLowerCase() : parseInt(chunk, 10)
        );
    };

    const chunksA = extractChunks(a || "");
    const chunksB = extractChunks(b || "");

    for (let i = 0; i < Math.max(chunksA.length, chunksB.length); i++) {
      const chunkA = chunksA[i] || "";
      const chunkB = chunksB[i] || "";

      if (chunkA < chunkB) return -1;
      if (chunkA > chunkB) return 1;
    }

    return 0;
  };

  jQuery.fn.dataTable.ext.type.order["alphanum-desc"] = function (a, b) {
    return jQuery.fn.dataTable.ext.type.order["alphanum-asc"](b, a);
  };

  // Apply custom sorting in your function
  window.sortDistrict = function () {
    extraData = "District";
    table.column(3).cells().invalidate();
    table.column(3).render();

    table
      .order([
        //      { name: "districtLet", dir: "asc" }, // Adjust as necessary for your use case
        { name: "district", dir: "asc" }, // Adjust as necessary for your use case
        { name: "lastName", dir: "asc" },
        { name: "firstName", dir: "asc" },
      ])
      .draw();
  };

  window.sortScore = function () {
    extraData = "Score";
    table.column(3).cells().invalidate();
    table.column(3).render();
    table
      .order([
        { name: "score", dir: "desc" },
        { name: "lastName", dir: "asc" },
        { name: "firstName", dir: "asc" },
      ])
      .draw();
  };

  window.showScore = function () {
    extraData = "Score";
    table.column(3).cells().invalidate();
    table.column(3).render();
  };

  window.showData = function (data) {
    extraData = data;
    table.column(3).cells().invalidate();
    table.column(3).render();
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

  window.filterGroup = function (index, groupId) {
    // Set the index as the group name
    committeeName = index;
    displayCom = true;
  
    // Filter by group ID
    table.columns([13]).search(groupId).draw();
  
    // Clear any existing highlights or extra styles
    table.rows().every(function () {
      const cell = $(this.node()).find("td:eq(2)");
      cell.removeClass("highlight-cell");
    });
  
    table.column().cells().invalidate();
    table.column().render();
  
    // Redraw the table with sorting based on name
    table
      .order([
        { name: "lastName", dir: "asc" },
        { name: "firstName", dir: "asc" },
      ])
      .draw();
  };
  

  window.filterCom = function (index, comId, chair, vicechair) {
    committeeName = index;
    displayCom = true;

    // Filter by committee ID
    table.columns([9]).search(comId).draw();

    // Helper function to normalize names
    function normalizeName(name) {
        const nameParts = name.split(/,|\s+/).filter(Boolean);
        let firstName = "";
        let middleInitial = "";
        let lastName = "";

        if (name.includes(",")) {
            [lastName, firstName] = nameParts.map((part) => part.trim());
        } else if (nameParts.length === 2) {
            [firstName, lastName] = nameParts.map((part) => part.trim());
        } else if (nameParts.length === 3) {
            [firstName, middleInitial, lastName] = nameParts.map((part) => part.trim());
        }

        return { firstName, middleInitial, lastName };
    }

    const chairName = normalizeName(chair);
    const vicechairName = normalizeName(vicechair);

    // Add custom flags to identify chair and vicechair rows
    table.rows().every(function () {
        const rowData = this.data();

        const isChair =
            rowData.FirstName === chairName.firstName &&
            (!chairName.middleInitial || rowData.MiddleName?.startsWith(chairName.middleInitial)) &&
            rowData.LastName === chairName.lastName;

        const isViceChair =
            rowData.FirstName === vicechairName.firstName &&
            (!vicechairName.middleInitial || rowData.MiddleName?.startsWith(vicechairName.middleInitial)) &&
            rowData.LastName === vicechairName.lastName;

        rowData.isChair = isChair;
        rowData.isViceChair = isViceChair;

        const cell = $(this.node()).find("td:eq(2)");
        cell.removeClass("highlight-cell chairred chairblue vicechairred vicechairblue");

        if (isChair) {
            if (rowData.Party === "R") {
                cell.addClass("chairred"); // Red for Republican Chair
            } else if (rowData.Party === "D") {
                cell.addClass("chairblue"); // Blue for Democrat Chair
            }
        } else if (isViceChair) {
            if (rowData.Party === "R") {
                cell.addClass("vicechairred"); // Light Red for Republican Vice Chair
            } else if (rowData.Party === "D") {
                cell.addClass("vicechairblue"); // Light Blue for Democrat Vice Chair
            }
        }
    });

    table.column().cells().invalidate();
    table.column().render();

    // Redraw the table after sorting
    table
        .order([
            { name: "isChair", dir: "desc" },
            { name: "isViceChair", dir: "desc" },
            { name: "lastName", dir: "asc" },
            { name: "firstName", dir: "asc" },
        ])
        .draw();
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
    displayCom = false;
    committeeName = "Legislators";
  
    // Ensure `table` refers to the DataTables instance
    const dataTable = $('#table').DataTable();
  
    // Clear highlights from the 3rd <td>
    dataTable.rows().every(function () {
      $(this.node()).find("td:eq(2)").removeClass("highlight-cell");
    });
  
    // Clear all filters
    dataTable.search("").columns().search("").draw();
  
    // Update the header title manually
    const headerDiv = document.getElementById("headerDiv");
    headerDiv.textContent = committeeName + " (" + dataTable.rows().count() + ")";

    table.column().cells().invalidate();
    table.column().render();

    // Redraw the table after sorting
    table
      .order([
        { name: "lastName", dir: "asc" },
        { name: "firstName", dir: "asc" },
      ])
      .draw();

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
    let data = dataExport.map((subArr) => subArr[11]);
    data = JSON.stringify(data);
    console.log(data);
    FileMaker.PerformScriptWithOption("wv_Export", data, "0");
  };

};