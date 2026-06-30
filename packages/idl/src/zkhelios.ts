/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/zkhelios.json`.
 */
export type Zkhelios = {
  "address": "Ei5ZkTC2M631gSpBoz3wz8szq7rikrUgRbzfwQ353w8Q",
  "metadata": {
    "name": "zkhelios",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "zkHelios — on-chain Groth16 verifier for zero-knowledge proofs on Solana"
  },
  "instructions": [
    {
      "name": "acceptAdminTransfer",
      "docs": [
        "Two-step admin transfer: proposed admin accepts."
      ],
      "discriminator": [
        89,
        211,
        96,
        212,
        233,
        0,
        251,
        7
      ],
      "accounts": [
        {
          "name": "newAdmin",
          "signer": true
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  101,
                  114,
                  105,
                  102,
                  105,
                  101,
                  114,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "closeProof",
      "docs": [
        "Close one of your own proof accounts and reclaim rent."
      ],
      "discriminator": [
        64,
        76,
        168,
        8,
        126,
        109,
        164,
        179
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "proofAccount"
          ]
        },
        {
          "name": "proofAccount",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "createUserAccount",
      "docs": [
        "Initialize the caller's UserAccount (idempotent)."
      ],
      "discriminator": [
        146,
        68,
        100,
        69,
        63,
        46,
        182,
        199
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "userAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initialize",
      "docs": [
        "Create the singleton VerifierConfig (once)."
      ],
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
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  101,
                  114,
                  105,
                  102,
                  105,
                  101,
                  114,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "admin",
          "type": "pubkey"
        },
        {
          "name": "treasury",
          "type": "pubkey"
        },
        {
          "name": "proofFeeLamports",
          "type": "u64"
        }
      ]
    },
    {
      "name": "proposeAdminTransfer",
      "docs": [
        "Two-step admin transfer: current admin proposes."
      ],
      "discriminator": [
        218,
        178,
        115,
        190,
        80,
        107,
        95,
        158
      ],
      "accounts": [
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "config"
          ]
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  101,
                  114,
                  105,
                  102,
                  105,
                  101,
                  114,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "newAdmin",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "registerCircuit",
      "docs": [
        "Register a circuit + its verifying key (admin only)."
      ],
      "discriminator": [
        208,
        247,
        241,
        136,
        81,
        166,
        206,
        199
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true,
          "relations": [
            "config"
          ]
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  101,
                  114,
                  105,
                  102,
                  105,
                  101,
                  114,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "circuit",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  105,
                  114,
                  99,
                  117,
                  105,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "circuitId"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "circuitId",
          "type": "u32"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "proofType",
          "type": {
            "defined": {
              "name": "proofType"
            }
          }
        },
        {
          "name": "verifyingKey",
          "type": "bytes"
        },
        {
          "name": "publicInputCount",
          "type": "u8"
        }
      ]
    },
    {
      "name": "revokeProof",
      "docs": [
        "Soft-revoke one of your own proofs."
      ],
      "discriminator": [
        59,
        117,
        210,
        117,
        75,
        24,
        100,
        117
      ],
      "accounts": [
        {
          "name": "authority",
          "signer": true,
          "relations": [
            "proofAccount"
          ]
        },
        {
          "name": "proofAccount",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "setCircuitEnabled",
      "docs": [
        "Enable or disable a registered circuit (admin only)."
      ],
      "discriminator": [
        12,
        197,
        13,
        224,
        26,
        196,
        107,
        45
      ],
      "accounts": [
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "config"
          ]
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  101,
                  114,
                  105,
                  102,
                  105,
                  101,
                  114,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "circuit",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  105,
                  114,
                  99,
                  117,
                  105,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "circuitId"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "circuitId",
          "type": "u32"
        },
        {
          "name": "enabled",
          "type": "bool"
        }
      ]
    },
    {
      "name": "updateConfig",
      "docs": [
        "Update config fields (admin only)."
      ],
      "discriminator": [
        29,
        158,
        252,
        191,
        10,
        83,
        219,
        99
      ],
      "accounts": [
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "config"
          ]
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  101,
                  114,
                  105,
                  102,
                  105,
                  101,
                  114,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "newFee",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "newPaused",
          "type": {
            "option": "bool"
          }
        },
        {
          "name": "newTreasury",
          "type": {
            "option": "pubkey"
          }
        }
      ]
    },
    {
      "name": "verifyProof",
      "docs": [
        "Verify a Groth16 proof on-chain and record an attestation."
      ],
      "discriminator": [
        217,
        211,
        191,
        110,
        144,
        13,
        186,
        98
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  101,
                  114,
                  105,
                  102,
                  105,
                  101,
                  114,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "circuit",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  105,
                  114,
                  99,
                  117,
                  105,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "circuitId"
              }
            ]
          }
        },
        {
          "name": "userAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "proofAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  111,
                  102
                ]
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "arg",
                "path": "nonce"
              }
            ]
          }
        },
        {
          "name": "treasury",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "circuitId",
          "type": "u32"
        },
        {
          "name": "proofA",
          "type": {
            "array": [
              "u8",
              64
            ]
          }
        },
        {
          "name": "proofB",
          "type": {
            "array": [
              "u8",
              128
            ]
          }
        },
        {
          "name": "proofC",
          "type": {
            "array": [
              "u8",
              64
            ]
          }
        },
        {
          "name": "publicInputs",
          "type": {
            "vec": {
              "array": [
                "u8",
                32
              ]
            }
          }
        },
        {
          "name": "nonce",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "circuitRegistry",
      "discriminator": [
        248,
        61,
        106,
        55,
        138,
        152,
        88,
        37
      ]
    },
    {
      "name": "proofAccount",
      "discriminator": [
        54,
        244,
        192,
        233,
        218,
        58,
        44,
        242
      ]
    },
    {
      "name": "userAccount",
      "discriminator": [
        211,
        33,
        136,
        16,
        186,
        110,
        242,
        127
      ]
    },
    {
      "name": "verifierConfig",
      "discriminator": [
        176,
        103,
        248,
        36,
        138,
        167,
        176,
        220
      ]
    }
  ],
  "events": [
    {
      "name": "adminTransferAccepted",
      "discriminator": [
        79,
        229,
        204,
        202,
        134,
        43,
        177,
        26
      ]
    },
    {
      "name": "adminTransferProposed",
      "discriminator": [
        203,
        168,
        175,
        51,
        239,
        104,
        20,
        85
      ]
    },
    {
      "name": "circuitRegistered",
      "discriminator": [
        237,
        254,
        63,
        233,
        38,
        74,
        220,
        153
      ]
    },
    {
      "name": "configUpdated",
      "discriminator": [
        40,
        241,
        230,
        122,
        11,
        19,
        198,
        194
      ]
    },
    {
      "name": "proofRevoked",
      "discriminator": [
        180,
        50,
        127,
        28,
        218,
        29,
        35,
        42
      ]
    },
    {
      "name": "proofVerified",
      "discriminator": [
        181,
        54,
        148,
        211,
        237,
        73,
        131,
        232
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "programPaused",
      "msg": "Program is paused"
    },
    {
      "code": 6001,
      "name": "circuitNotFound",
      "msg": "Circuit not found"
    },
    {
      "code": 6002,
      "name": "circuitDisabled",
      "msg": "Circuit is disabled"
    },
    {
      "code": 6003,
      "name": "invalidPublicInputCount",
      "msg": "Invalid public input count"
    },
    {
      "code": 6004,
      "name": "invalidProofFormat",
      "msg": "Invalid proof format"
    },
    {
      "code": 6005,
      "name": "proofVerificationFailed",
      "msg": "Proof verification failed"
    },
    {
      "code": 6006,
      "name": "insufficientFunds",
      "msg": "Insufficient funds"
    },
    {
      "code": 6007,
      "name": "unauthorized",
      "msg": "Unauthorized"
    },
    {
      "code": 6008,
      "name": "invalidAdmin",
      "msg": "Invalid admin"
    },
    {
      "code": 6009,
      "name": "noPendingAdminTransfer",
      "msg": "No pending admin transfer"
    },
    {
      "code": 6010,
      "name": "nonceAlreadyUsed",
      "msg": "Nonce already used"
    },
    {
      "code": 6011,
      "name": "invalidVerifyingKey",
      "msg": "Invalid verifying key"
    },
    {
      "code": 6012,
      "name": "proofAlreadyExists",
      "msg": "Proof already exists"
    }
  ],
  "types": [
    {
      "name": "adminTransferAccepted",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "oldAdmin",
            "type": "pubkey"
          },
          {
            "name": "newAdmin",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "adminTransferProposed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "currentAdmin",
            "type": "pubkey"
          },
          {
            "name": "newAdmin",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "circuitRegistered",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "circuitId",
            "type": "u32"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "admin",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "circuitRegistry",
      "docs": [
        "Per-circuit registry entry. PDA seeds: [\"circuit\", circuit_id u32 LE]."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "circuitId",
            "type": "u32"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "proofType",
            "type": {
              "defined": {
                "name": "proofType"
              }
            }
          },
          {
            "name": "verifyingKey",
            "docs": [
              "Serialized Groth16 verifying key (alpha|beta|gamma|delta|ic…), big-endian."
            ],
            "type": "bytes"
          },
          {
            "name": "publicInputCount",
            "type": "u8"
          },
          {
            "name": "enabled",
            "type": "bool"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "configUpdated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "proofAccount",
      "docs": [
        "Per-proof attestation. PDA seeds: [\"proof\", authority, nonce u64 LE], where",
        "`nonce` is a client-generated cryptographically random u64. The `init`",
        "constraint makes a reused nonce fail (auto duplicate rejection)."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "circuitId",
            "type": "u32"
          },
          {
            "name": "proofType",
            "type": {
              "defined": {
                "name": "proofType"
              }
            }
          },
          {
            "name": "publicInputs",
            "type": {
              "vec": {
                "array": [
                  "u8",
                  32
                ]
              }
            }
          },
          {
            "name": "proofHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "verified",
            "type": "bool"
          },
          {
            "name": "verifiedAt",
            "type": "i64"
          },
          {
            "name": "slotVerified",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "proofRevoked",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "proofAccount",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "proofType",
      "docs": [
        "The kind of statement a circuit proves."
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "balance"
          },
          {
            "name": "ownership"
          },
          {
            "name": "age"
          },
          {
            "name": "membership"
          },
          {
            "name": "custom"
          }
        ]
      }
    },
    {
      "name": "proofVerified",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "proofAccount",
            "type": "pubkey"
          },
          {
            "name": "circuitId",
            "type": "u32"
          },
          {
            "name": "proofType",
            "type": {
              "defined": {
                "name": "proofType"
              }
            }
          },
          {
            "name": "slot",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "userAccount",
      "docs": [
        "Per-user account. PDA seeds: [\"user\", authority]. `proof_count` is for stats",
        "only — it is NOT a PDA seed source (nonces are client-random)."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "proofCount",
            "type": "u64"
          },
          {
            "name": "firstSeen",
            "type": "i64"
          },
          {
            "name": "lastActive",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "verifierConfig",
      "docs": [
        "Singleton program config. PDA seeds: [\"verifier_config\"]."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "pendingAdmin",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "paused",
            "type": "bool"
          },
          {
            "name": "proofFeeLamports",
            "type": "u64"
          },
          {
            "name": "treasury",
            "type": "pubkey"
          },
          {
            "name": "registeredCircuits",
            "type": "u32"
          },
          {
            "name": "totalProofsVerified",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "constants": [
    {
      "name": "circuitSeed",
      "type": "bytes",
      "value": "[99, 105, 114, 99, 117, 105, 116]"
    },
    {
      "name": "proofSeed",
      "type": "bytes",
      "value": "[112, 114, 111, 111, 102]"
    },
    {
      "name": "userSeed",
      "type": "bytes",
      "value": "[117, 115, 101, 114]"
    },
    {
      "name": "verifierConfigSeed",
      "type": "bytes",
      "value": "[118, 101, 114, 105, 102, 105, 101, 114, 95, 99, 111, 110, 102, 105, 103]"
    }
  ]
};
