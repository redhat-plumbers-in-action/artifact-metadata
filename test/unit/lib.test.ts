import { beforeEach, describe, expect, test } from 'vitest';

import MetadataController from '../../src';
import { assignNewMetadata, parseMetadata } from '../../src/lib';

import { MetadataObject } from '../../src/schema';

const body = {
  simple: `{"foo":"bar"}`,
  complex: `{"foo":"bar","bar":"baz","array":["a","b"],"arrayObject":[{"a":"b"},{"foo":"bar"}]}`,
};

let controller: MetadataController;

describe('Test utility functions', () => {
  beforeEach(() => {
    controller = new MetadataController('util_test', {
      owner: 'owner',
      repo: 'repo',
      headers: {
        authorization: 'token',
      },
    });
  });

  test('parseMetadata()', () => {
    let metadata = parseMetadata(body.simple, undefined);
    expect(metadata).toMatchInlineSnapshot(`
      {
        "foo": "bar",
      }
    `);

    metadata = parseMetadata(body.simple, 'foo');
    expect(metadata).toMatchInlineSnapshot(`"bar"`);

    expect(parseMetadata(body.complex, undefined)).toMatchInlineSnapshot(`
      {
        "array": [
          "a",
          "b",
        ],
        "arrayObject": [
          {
            "a": "b",
          },
          {
            "foo": "bar",
          },
        ],
        "bar": "baz",
        "foo": "bar",
      }
    `);
    expect(parseMetadata(body.complex, 'foo')).toMatchInlineSnapshot(`"bar"`);
    expect(parseMetadata(body.complex, 'array')).toMatchInlineSnapshot(`
      [
        "a",
        "b",
      ]
    `);
    expect(parseMetadata(body.complex, 'arrayObject')).toMatchInlineSnapshot(`
      [
        {
          "a": "b",
        },
        {
          "foo": "bar",
        },
      ]
    `);
  });

  test('assignNewMetadata()', () => {
    let metadata = {
      array: ['a', 'b'],
      arrayObject: [{ a: 'b' }, { foo: 'bar' }],
      bar: 'baz',
      foo: 'bar',
    } as MetadataObject;

    let result = assignNewMetadata(metadata, 'bar', 'baz');
    expect(result).toMatchInlineSnapshot(`
      {
        "array": [
          "a",
          "b",
        ],
        "arrayObject": [
          {
            "a": "b",
          },
          {
            "foo": "bar",
          },
        ],
        "bar": "baz",
        "foo": "bar",
      }
    `);
    expect(result['bar']).toMatchInlineSnapshot(`"baz"`);

    result = assignNewMetadata(metadata, { bar: ['a', 'b', 'c'] });
    expect(result).toMatchInlineSnapshot(`
      {
        "array": [
          "a",
          "b",
        ],
        "arrayObject": [
          {
            "a": "b",
          },
          {
            "foo": "bar",
          },
        ],
        "bar": [
          "a",
          "b",
          "c",
        ],
        "foo": "bar",
      }
    `);
    expect(result['bar']).toMatchInlineSnapshot(`
      [
        "a",
        "b",
        "c",
      ]
    `);
  });
});
