# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [UNRELEASED]

### Added

- Implemented `GameObject.defaultValues()` method to allow child classes to assign default values for their properties. This circumvents an issue with JavaScript's inheritance where value assignments in class field declarations are executed after parent constructor calls, which leads to default values in sub classes to always be applied.

- Implemented `GameObject.getNonCircularCopy()` method that returns a deep copy of a game object without any `owner` references.

### Fixed

- `Dependency` now checks against modified values instead of actual values when checking numeric properties.
- `GameObject.addChild()` now checks whether an invalid child is being added.
- `GameObject.serialize()` now makes use of `GameObject.getNonCircularCopy()` and properly applies serialization recursively.

### Refactored

- `applyModifiers()` is now a static function of the `Modifier` class.
- Renamed `Dependency.name` to `Dependency.dependencyName` to prevent conflicts with `GameObject.name`.

## [0.1.0] 2024-06-09

🌟 Initial release.
