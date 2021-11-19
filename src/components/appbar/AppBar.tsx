/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AppBar as MaterialAppBar, IconButton, Toolbar } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Logo from "../../resources/images/invoiceninja-logox53.png";
import { Box } from "@mui/system";

export function AppBar() {
  return (
    <MaterialAppBar
      position="fixed"
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Toolbar>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              size="small"
              sx={{ display: { xs: "none", md: "block" }, marginRight: 2 }}
              aria-label="Toggle sidebar"
            >
              <MenuIcon style={{ color: "white" }} />
            </IconButton>

            <img src={Logo} alt="Invoice Ninja logo" height={30} />
          </Box>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              size="small"
              sx={{ display: { xs: "block", md: "none" } }}
              aria-label="Toggle sidebar"
            >
              <MenuIcon style={{ color: "white" }} />
            </IconButton>
          </Box>
        </Box>
      </Toolbar>
    </MaterialAppBar>
  );
}
