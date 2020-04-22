/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React, { ComponentType, FunctionComponent } from 'react';
import Select, { Props as SelectProps, OptionTypeBase } from 'react-select';
import MenuList, { WindowedMenuListProps } from './MenuList';

export type WindowedSelectProps<
  OptionType extends OptionTypeBase
> = SelectProps<OptionType> & {
  windowThreshold?: number;
} & WindowedMenuListProps['selectProps'];

export type WindowedSelectComponentType<
  OptionType extends OptionTypeBase
> = FunctionComponent<WindowedSelectProps<OptionType>>;

/**
 * Check weather to render virtualized list with react-window.
 * Currently grouped options are not supported.
 */
function shouldVirtualize<OptionType extends OptionTypeBase>(
  options: SelectProps<OptionType>['options'] = [],
  windowThreshold: number,
) {
  const isGrouped = Array.isArray((options[0] || {}).options);
  return !isGrouped && options.length > windowThreshold;
}

/**
 * Add "windowThreshold" option to a react-select component, turn the options
 * list into a virtualized list when appropriate.
 *
 * @param SelectComponent the React component to render Select
 */
export default function windowed<OptionType extends OptionTypeBase>(
  SelectComponent: ComponentType<SelectProps<OptionType>>,
): WindowedSelectComponentType<OptionType> {
  function WindowedSelect(
    props: WindowedSelectProps<OptionType>,
    ref: React.RefObject<Select<OptionType>>,
  ) {
    const {
      windowThreshold = 1000,
      components: components_ = {},
      options,
      ...restProps
    } = props;
    const components = { ...components_ };
    if (shouldVirtualize(options, windowThreshold)) {
      if (components.MenuList) {
        throw new Error(
          "It's not possible to customize MenuList when virtualized list is need.",
        );
      }
      components.MenuList = MenuList;
    }
    return (
      <SelectComponent
        components={components}
        ref={ref}
        options={options}
        {...restProps}
      />
    );
  }
  return React.forwardRef(WindowedSelect);
}
