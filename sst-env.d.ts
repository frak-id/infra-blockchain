/* This file is auto-generated by SST. Do not edit. */
/* tslint:disable */
/* eslint-disable */
/* deno-fmt-ignore-file */

declare module "sst" {
  export interface Resource {
    "MasterVpc": {
      "bastion": string
      "type": "sst.aws.Vpc"
    }
    "blockchain": {
      "database": string
      "host": string
      "password": string
      "port": number
      "type": "sst.aws.Postgres"
      "username": string
    }
  }
}
/// <reference path="sst-env.d.ts" />

import "sst"
export {}