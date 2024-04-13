//import data from "./legislator";

window.loadData = (json, officeFilter) => {
  const data = JSON.parse(json);

  const formattedData = data.data.map((e) => Object(e.fieldData));
  formattedData.forEach(function (row, index) {
    row.index = index;
  });
  formattedData.forEach(function (row) {
    row.DistrictNum = Number(row.District.replace(/\D/g, ""));
  });

  let filteredData = [];

  console.log(formattedData);

  for (let i = 0; i < formattedData.length; i++) {
    if (formattedData[i].Office === officeFilter) {
      filteredData = [...filteredData, formattedData[i]];
    }
  }

  const finalData = filteredData;

  console.log(filteredData);

  const formatData = data.data.map((e) =>
    Object.keys(e.fieldData).map((key) => e.fieldData[key])
  );

  let markArray = data.markArray;

  $.extend(true, $.fn.dataTable.defaults, {
    language: {
      search: "",
    },
  });

  //console.log(formattedData);

  const table = $("#table").DataTable({
    data: finalData,
    paging: false,
    scrollResize: true,
    scrollCollapse: true,
    scrollY: "100%",
    ordering: true,
    info: false,
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

            console.log(markArray.length);

            if (markArray.includes(row._ID)) {
              markArray = markArray.filter(function (id) {
                return id !== row._ID;
              });
            } else {
              markArray.push(row._ID);
            }
            console.log(markArray.length);
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
          $vertL.appendChild(mark).appendChild(buttonMail);
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
          const name = document.createElement("div");
          name.onclick = function () {
            let result = (({ _ID }) => ({ _ID }))(row);
            result.action = "navigate";
            callFM(result);
            event.stopPropagation();
          };
          name.classList.add("bold");
          name.textContent = row.FirstName + " " + row.LastName;
          return name;
        },
        orderable: false,
      },
      {
        //District
        render: function (data, type, row) {
          const $district = document.createElement("div");
          $district.classList.add("district");
          $district.textContent = row.District;
          return $district;
        },
        visible: false,
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
    table.columns([11,12,13]).visible(false);

    table
      .order([
        { name: "lastName", dir: "asc" },
        { name: "firstName", dir: "asc" },
      ])
      .draw();
  };

  window.sortDistrict = function () {
    table.columns([12, 13]).visible(false);
    table.columns([11]).visible(true);
    table
      .order([
        { name: "district", dir: "asc" },
        { name: "lastName", dir: "asc" },
        { name: "firstName", dir: "asc" },
      ])
      .draw();
  };

  window.sortValue = function () {
    table.columns([11, 13]).visible(false);
    table.columns([12]).visible(true);
    table
      .order([
        { name: "value", dir: "desc" },
        { name: "lastName", dir: "asc" },
        { name: "firstName", dir: "asc" },
      ])
      .draw();
  };

  window.sortOffice = function () {
    table.columns([11, 12]).visible(false);
    table.columns([13]).visible(true);
    table
      .order([
        { name: "officeAddress", dir: "asc" },
        { name: "lastName", dir: "asc" },
        { name: "firstName", dir: "asc" },
      ])
      .draw();
  };

  window.filterDem = function () {
    table.columns([5]).search("D").draw();
  };

  window.filterRep = function () {
    table.columns([5]).search("R").draw();
  };

  window.filterNew = function () {
    table.columns([6]).search("Newly Elected").draw();
  };

  window.filterMark = function () {
    table.columns([7]).search(true).draw();
  };

  window.filterAll = function () {
    table.search("").columns().search("").draw();
  };

  window.callFM = function (result) {
    FileMaker.PerformScript("wv_runScript", JSON.stringify(result));
  };

  window.refreshRow = function (row) {
    table.row(row).invalidate().draw();
  };

  //custom format of Search boxes
  $("[type=search]").each(function () {
    $(this).attr("placeholder", "Search...");
    //  $(this).before('<span class="fa fa-search"></span>');
  });
};
