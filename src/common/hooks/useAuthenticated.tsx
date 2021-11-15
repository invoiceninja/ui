/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import axios, { AxiosError, AxiosResponse } from "axios";
import { useDispatch, useSelector } from "react-redux";
import { AuthenticationTypes } from "../dtos/authentication";
import { endpoint } from "../helpers";
import { authenticate } from "../stores/slices/user";
import { RootState } from "../stores/store";

export function useAuthenticated(): Boolean {
  const user = useSelector((state: RootState) => state.user);
  const token = localStorage.getItem("X-NINJA-TOKEN");
  const dispatch = useDispatch();

  if (token === null) return false;
  if (user.authenticated) return true;

  axios
    .post(
      endpoint("/api/v1/refresh"),
      {},
      {
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "X-Api-Token": localStorage.getItem("X-NINJA-TOKEN") as string,
        },
      }
    )
    .then((response: AxiosResponse) => {
      if (response.status === 200) {
        dispatch(
          authenticate({
            type: AuthenticationTypes.TOKEN,
            user: response.data.data[0].user,
          })
        );
      }
    })
    .catch((error: AxiosError) => {
      // Clear storage item..
    });

  return true;
}
