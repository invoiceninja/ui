/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { route } from "../../src/common/helpers/route";

describe("route", () => {
  test("without any params passed, return string as is", () => {
    expect(route("/api/v1/example")).toEqual("/api/v1/example");
  });

  test("replacing single part of the url", () => {
    expect(route("/api/v1/:id/example", { id: 1 })).toEqual(
      "/api/v1/1/example",
    );
  });

  test("replacing multiple values of the url", () => {
    expect(route("/api/v1/:first/:second", { first: 1, second: 2 })).toEqual(
      "/api/v1/1/2",
    );
  });

  test("reaplcing when tightly coupled", () => {
    expect(route("/api/v1/:first:second", { first: 1, second: 2 })).toEqual(
      "/api/v1/12",
    );
  });

  test("keeping relative includes", () => {
    expect(route("/api/v1/invoices/:id?include=client", { id: 1 })).toEqual(
      "/api/v1/invoices/1?include=client",
    );
  });

  test("using for generic single replacement (translations)", () => {
    expect(route(":count Hours", { count: "30" })).toEqual("30 Hours");
  });
});
