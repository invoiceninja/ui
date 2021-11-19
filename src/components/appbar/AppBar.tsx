/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import {
  AppBar as MaterialAppBar,
  Avatar,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Logo from "../../resources/images/invoiceninja-logox53.png";
import { Box } from "@mui/system";
import { useTranslation } from "react-i18next";
import { green } from "@mui/material/colors";
import { CompanySelector } from "./CompanySelector";
import { Link } from "react-router-dom";

export function AppBar() {
  const [t] = useTranslation();

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

            <Link
              to="/dashboard"
              style={{ display: "inline-flex", justifyItems: "center" }}
            >
              <img src={Logo} alt="Invoice Ninja logo" height={27} />
            </Link>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box
              sx={{ display: { xs: "none", md: "flex" } }}
              style={{ display: "flex" }}
            >
              <Button
                sx={{
                  bgcolor: green[700],
                  display: { xs: "none", md: "block" },
                }}
                disableElevation
                variant="contained"
              >
                {t("upgrade")}
              </Button>
              <CompanySelector />
            </Box>

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
