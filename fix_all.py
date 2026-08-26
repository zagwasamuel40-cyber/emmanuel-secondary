import re

with open("src/pages/AdmissionsManagement.tsx", "r") as f:
    content = f.read()

# First, let's normalize all tab closings from:
#         </Card>
#         </div>
#       )}
# AND
#         </Card>
#       )}
# to just:
#         </Card>
#       )}
content = re.sub(r'</Card>\s*</div>\s*\)}', '</Card>\n      )}', content)

# Now, we need to specifically add `</div>` to `verification` and `exams`.
# Let's find the closing of `verification`:
# It ends with `                  </div>\n                ))}\n              </div>\n            </CardContent>\n          </Card>\n      )}`
content = content.replace(
    '                ))}\n              </div>\n            </CardContent>\n          </Card>\n      )}',
    '                ))}\n              </div>\n            </CardContent>\n          </Card>\n        </div>\n      )}'
)

# And for `exams`:
# It ends with `                  ))}\n                </tbody>\n              </table>\n            </div>\n          </CardContent>\n        </Card>\n      )}`
# Wait, this same block is used by `offers`.
# `offers` also has a table with `                  ))}\n                </tbody>\n              </table>\n            </div>\n          </CardContent>\n        </Card>\n      )}`
# To safely target `exams`, we can find the exact text in `exams`:
# The `exams` button is "Generate Offer".
# The `offers` button is probably something else.

exams_block = '''                      <td className="p-3 text-right">
                        <Button 
                          onClick={() => handleIssueOffer(app)}
                          disabled={app.examScore < admissionSettings.passCutoff}
                          size="sm"
                          className="h-8 text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold disabled:opacity-40"
                        >
                          Generate Offer
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}'''

exams_block_fixed = exams_block.replace('        </Card>\n      )}', '        </Card>\n        </div>\n      )}')

content = content.replace(exams_block, exams_block_fixed)

with open("src/pages/AdmissionsManagement.tsx", "w") as f:
    f.write(content)
