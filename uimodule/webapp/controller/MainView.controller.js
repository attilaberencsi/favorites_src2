sap.ui.define([
  "com/otisoft/favs/Favorites/controller/BaseController",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator"
], function (
  BaseController,
  Filter,
  FilterOperator
) {
  "use strict";

  return BaseController.extend("com.otisoft.favs.Favorites.controller.MainView", {

    /**
     * Setup
     * @override
     */
    onInit: function () {
      this.suspendPanelEvents = false;
      // Store reference to the original data for filtering
      let favoritesModel = this.getOwnerComponent().getModel("favorites");
      this.originalGroups = JSON.parse(JSON.stringify(favoritesModel.getProperty("/groups")));
    },
    /**
     * Click on the tile
     * @param {*} sUrl Favorite page link
     */
    onPress: function (sUrl) {
      sap.m.URLHelper.redirect(sUrl, true);
    },

    /**
     * Search handler - filters groups based on header and subheader
     * @param {*} oEvent Search event
     */
    onSearch: function (oEvent) {
      this.applySearchFilter();
    },

    /**
     * Live search handler - filters as user types
     * @param {*} oEvent Live change event
     */
    onSearchLiveChange: function (oEvent) {
      this.applySearchFilter();
    },

    /**
     * Apply binding filters to the list based on search value
     */
    applySearchFilter: function () {
      let oList = this.getView().byId("idGroupsList");
      let oBinding = oList.getBinding("items");
      let oSearchField = this.getView().byId("idSearchField");
      let sSearchValue = oSearchField.getValue().toLowerCase();

      if (!sSearchValue) {
        // No search value, clear all filters
        oBinding.filter([]);
        // Clear filters on all child bindings
        this._clearChildFilters();
        return;
      }

      // Create filters for tiles and links
      let oTileFilter = new Filter({
        test: (tile) => {
          return (tile.header && tile.header.toLowerCase().includes(sSearchValue)) ||
                 (tile.subheader && tile.subheader.toLowerCase().includes(sSearchValue));
        }
      });

      let oLinkFilter = new Filter({
        test: (link) => {
          return (link.header && link.header.toLowerCase().includes(sSearchValue)) ||
                 (link.subheader && link.subheader.toLowerCase().includes(sSearchValue));
        }
      });

      // Create a custom filter function that checks tiles and links
      let fnCustomFilter = (group) => {
        // Check if any tile matches the search
        if (group.tiles) {
          for (let tile of group.tiles) {
            if ((tile.header && tile.header.toLowerCase().includes(sSearchValue)) ||
                (tile.subheader && tile.subheader.toLowerCase().includes(sSearchValue))) {
              return true;
            }
          }
        }

        // Check if any link matches the search
        if (group.links) {
          for (let link of group.links) {
            if ((link.header && link.header.toLowerCase().includes(sSearchValue)) ||
                (link.subheader && link.subheader.toLowerCase().includes(sSearchValue))) {
              return true;
            }
          }
        }

        return false;
      };

      // Create filter with custom function to show only matching groups
      let oGroupFilter = new Filter({
        test: fnCustomFilter
      });

      oBinding.filter([oGroupFilter]);

      // Apply filters to child bindings
      this._applyChildFilters(oTileFilter, oLinkFilter);
    },

    /**
     * Apply filters to all tile and link bindings
     */
    _applyChildFilters: function (oTileFilter, oLinkFilter) {
      let oList = this.getView().byId("idGroupsList");
      let aItems = oList.getItems();

      aItems.forEach((item) => {
        // Get the panel from the custom list item
        let oPanel = item.getContent()[0];
        if (!oPanel || !oPanel.getContent) return;

        // Get the vertical layout from the panel
        let oVerticalLayout = oPanel.getContent()[0];
        if (!oVerticalLayout || !oVerticalLayout.getContent) return;

        // Get the horizontal layouts from the vertical layout
        let aLayouts = oVerticalLayout.getContent();

        // First layout should be tiles, second should be links
        if (aLayouts[0] && aLayouts[0].getBinding) {
          let oBinding = aLayouts[0].getBinding("content");
          if (oBinding) {
            oBinding.filter([oTileFilter]);
          }
        }

        if (aLayouts[1] && aLayouts[1].getBinding) {
          let oBinding = aLayouts[1].getBinding("content");
          if (oBinding) {
            oBinding.filter([oLinkFilter]);
          }
        }
      });
    },

    /**
     * Clear all filters from child bindings
     */
    _clearChildFilters: function () {
      let oList = this.getView().byId("idGroupsList");
      let aItems = oList.getItems();

      aItems.forEach((item) => {
        // Get the panel from the custom list item
        let oPanel = item.getContent()[0];
        if (!oPanel || !oPanel.getContent) return;

        // Get the vertical layout from the panel
        let oVerticalLayout = oPanel.getContent()[0];
        if (!oVerticalLayout || !oVerticalLayout.getContent) return;

        // Get the horizontal layouts from the vertical layout
        let aLayouts = oVerticalLayout.getContent();

        // Clear filters on all layouts with content bindings
        aLayouts.forEach((layout) => {
          if (layout.getBinding) {
            let oBinding = layout.getBinding("content");
            if (oBinding) {
              oBinding.filter([]);
            }
          }
        });
      });
    },

    /**
     * Group Panel opened/closed. We handle panel opening, and
     * close other panels to free up space and save scrolling
     * @param {*} oEvent Panel expansion/collapse event
     */
    onPanelExpand: function (oEvent) {

      let expanded = oEvent.getParameter("expand");
      // panel representing a group was opened by user=>close other panels
      if (expanded) {
        let groupId = oEvent.getSource().data().groupId;
        if (groupId) {
          this.collapseGroupsExcept(groupId);
        }
      }
    },

    /**
     * Close all group panels except the given one
     * For simplicity we use the group title as ID
     * => do not use teh same group title in favorites.json :D
     * @param {*} groupId Group Id to keep open
     */
    collapseGroupsExcept: function (groupId) {

      let favoritesModel = this.getOwnerComponent().getModel("favorites");
      let groups = favoritesModel.getProperty("/groups");
      for (let group of groups) {
        if (group.title !== groupId) {
          group.expanded = false;
        }
      }
    }

  });
});