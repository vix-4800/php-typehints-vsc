<?php

/**
 * Built-in PHP Functions
 *
 * Tests parameter hints for standard PHP library functions
 */

// ============================================================================
// STRING FUNCTIONS
// ============================================================================

// Expected: substr(string: $text, offset: 0, length: 5)
$result = substr($text, 0, 5);

// Expected: str_replace(search: "old", replace: "new", subject: $content)
$newText = str_replace("old", "new", $content);

// Expected: sprintf(format: "User: %s", values: $username)
$formatted = sprintf("User: %s", $username);

// Expected: strtoupper(string: $text)
$upper = strtoupper($text);

// Expected: trim(string: $input, characters: " \t")
$trimmed = trim($input, " \t");

// Expected: explode(separator: ",", string: $csv)
$parts = explode(",", $csv);

// Expected: implode(separator: ", ", array: $items)
$joined = implode(", ", $items);

// ============================================================================
// ARRAY FUNCTIONS
// ============================================================================

// Expected: array_map(callback: $transformer, array: $items)
$mapped = array_map($transformer, $items);

// Expected: array_filter(array: $data, callback: $predicate)
$filtered = array_filter($data, $predicate);

// Expected: array_reduce(array: $numbers, callback: $reducer, initial: 0)
$sum = array_reduce($numbers, $reducer, 0);

// Expected: in_array(needle: $value, haystack: $array, strict: true)
$exists = in_array($value, $array, true);

// Expected: array_key_exists(key: "id", array: $data)
$hasKey = array_key_exists("id", $data);

// Expected: array_merge(arrays: $arr1, arrays: $arr2)
$merged = array_merge($arr1, $arr2);

// Expected: array_slice(array: $items, offset: 0, length: 10)
$slice = array_slice($items, 0, 10);

// Expected: sort(array: $numbers, flags: SORT_NUMERIC)
sort($numbers, SORT_NUMERIC);

// ============================================================================
// FILE FUNCTIONS
// ============================================================================

// Expected: file_get_contents(filename: "data.txt")
$content = file_get_contents("data.txt");

// Expected: file_put_contents(filename: "output.txt", data: $content)
file_put_contents("output.txt", $content);

// Expected: fopen(filename: "file.txt", mode: "r")
$handle = fopen("file.txt", "r");

// ============================================================================
// JSON FUNCTIONS
// ============================================================================

// Expected: json_encode(value: $data, flags: JSON_PRETTY_PRINT)
$json = json_encode($data, JSON_PRETTY_PRINT);

// Expected: json_decode(json: $jsonString, associative: true)
$decoded = json_decode($jsonString, true);

// ============================================================================
// DATE/TIME FUNCTIONS
// ============================================================================

// Expected: date(format: "Y-m-d H:i:s", timestamp: $timestamp)
$formatted = date("Y-m-d H:i:s", $timestamp);

// Expected: strtotime(datetime: "2024-01-15")
$time = strtotime("2024-01-15");

// ============================================================================
// MATH FUNCTIONS
// ============================================================================

// Expected: round(num: $value, precision: 2)
$rounded = round($value, 2);

// Expected: min(values: $a, values: $b, values: $c)
$minimum = min($a, $b, $c);

// Expected: max(values: $x, values: $y)
$maximum = max($x, $y);

// Expected: abs(num: $number)
$absolute = abs($number);

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

// Expected: filter_var(value: $email, filter: FILTER_VALIDATE_EMAIL)
$valid = filter_var($email, FILTER_VALIDATE_EMAIL);

// Expected: preg_match(pattern: "/\d+/", subject: $text)
$matches = preg_match("/\d+/", $text);

// Expected: preg_replace(pattern: "/\s+/", replacement: " ", subject: $text)
$cleaned = preg_replace("/\s+/", " ", $text);
