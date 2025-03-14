import { Idl } from '@coral-xyz/anchor';

export type CounterAccount = {
  count: number;
  authority: string;
};

export const idl = {
    "address": "4r6tCfcZddGA72vHBoCSB35oCYu7Ftqr3E7Psy2bfj8V",
    "metadata": {
      "name": "contract",
      "version": "0.1.0",
      "spec": "0.1.0",
      "description": "Created with Anchor"
    },
    "instructions": [
      {
        "name": "increment",
        "discriminator": [
          11,
          18,
          104,
          9,
          104,
          174,
          59,
          33
        ],
        "accounts": [
          {
            "name": "counter",
            "writable": true
          },
          {
            "name": "authority",
            "signer": true,
            "relations": [
              "counter"
            ]
          }
        ],
        "args": []
      },
      {
        "name": "initialize",
        "discriminator": [
          175,
          175,
          109,
          31,
          13,
          152,
          155,
          237
        ],
        "accounts": [
          {
            "name": "counter",
            "writable": true,
            "signer": true
          },
          {
            "name": "authority",
            "writable": true,
            "signer": true
          },
          {
            "name": "system_program",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": []
      }
    ],
    "accounts": [
      {
        "name": "Counter",
        "discriminator": [
          255,
          176,
          4,
          245,
          188,
          253,
          124,
          25
        ]
      }
    ],
    "types": [
      {
        "name": "Counter",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "count",
              "type": "u64"
            },
            {
              "name": "authority",
              "type": "pubkey"
            }
          ]
        }
      }
    ]
  } as Idl;